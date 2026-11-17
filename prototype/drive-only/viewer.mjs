import {DriveOnlyClient,DriveOnlyError} from './client.mjs';

/**
 * Camada de visualização da V1: consulta a sessão uma vez ao abrir o portal,
 * reutiliza o cookie do backend para todas as imagens e PDFs e nunca executa
 * OAuth a cada arquivo. Projeto em homologação, não ativado no HTML público.
 */
export class DriveOnlyViewer {
  #client;
  #urlApi;
  #state='unknown';
  #bootPromise=null;
  #objects=new Set();
  constructor({client=new DriveOnlyClient(),urlApi=globalThis.URL}={}){
    if(typeof client.session!=='function'||typeof client.media!=='function')
      throw new TypeError('Cliente autenticado inválido');
    this.#client=client;this.#urlApi=urlApi;
  }
  get state(){return this.#state}
  get loginPath(){return this.#client.signInPath()}
  async boot(){
    if(this.#bootPromise)return this.#bootPromise;
    this.#bootPromise=(async()=>{
      try {
        const session=await this.#client.session();
        this.#state=session.authenticated?'authenticated':'login-required';
        return session;
      }catch(error){
        this.#state=error?.code==='LOGIN_REQUIRED'?'login-required':'unavailable';
        throw error;
      }
    })();
    return this.#bootPromise;
  }
  /** O navegador carrega todas as mídias via cookie HTTP-only (sem popup). */
  async load(mediaKey,purpose='image'){
    await this.boot();
    if(this.#state!=='authenticated')
      throw new DriveOnlyError('Entre com Google antes de consultar o acervo','LOGIN_REQUIRED');
    let blob;
    try{blob=await this.#client.media(mediaKey,{purpose})}
    catch(error){
      if(['LOGIN_REQUIRED','FORBIDDEN'].includes(error?.code))this.#state='login-required';
      throw error;
    }
    const url=this.#urlApi.createObjectURL(blob);
    this.#objects.add(url);
    return url;
  }
  async image(mediaKey){return this.load(mediaKey,'image')}
  async pdf(mediaKey){return this.load(mediaKey,'pdf')}
  release(url){
    if(this.#objects.delete(url))this.#urlApi.revokeObjectURL(url);
  }
  async logout(csrfToken){
    await this.#client.signOut(csrfToken);
    this.#state='login-required';
    this.#bootPromise=null;
    this.clear();
  }
  clear(){
    for(const url of this.#objects)this.#urlApi.revokeObjectURL(url);
    this.#objects.clear();
  }
}
