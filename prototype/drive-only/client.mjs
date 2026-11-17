/**
 * Cliente de transição V1 -> Drive-only.
 *
 * Nenhuma credencial, ID de arquivo privado ou base fica neste módulo.
 * O backend SAME-ORIGIN valida a sessão e lê arquivos do Drive autorizado.
 * NÃO ativado na V1 publicada até existir backend homologado e paridade dos dados.
 */
export const DATASETS=Object.freeze(['cards','evolutive','images','pdfs','srs','annotations','associations','questions']);

export class DriveOnlyError extends Error {
  constructor(message,code='DRIVE_ONLY_ERROR') {
    super(message);this.name='DriveOnlyError';this.code=code;
  }
}

export class DriveOnlyClient {
  constructor({fetcher=globalThis.fetch,base='/api/banco-mestre'}={}) {
    if(typeof fetcher!=='function') throw new TypeError('Fetch autenticado necessário');
    if(!new RegExp('^/[A-Za-z0-9/_-]+throw new TypeError('API somente no mesmo domínio');
    this.fetcher=fetcher;
    this.base=base;
  }
  async #request(path,{method='GET',body}={}) {
    const url=this.base+path;
    const options={
      method,credentials:'include',cache:'no-store',redirect:'error',
      headers:{'Accept':'application/json'}
    };
    if(body!==undefined) {
      options.headers['Content-Type']='application/json';
      options.body=JSON.stringify(body);
    }
    let response;
    try{response=await this.fetcher(url,options)}
    catch(e){throw new DriveOnlyError('Servidor de dados indisponível; nenhuma base pública substituída','UNAVAILABLE')}
    if(response.status===401)throw new DriveOnlyError('É necessário entrar na conta Google','LOGIN_REQUIRED');
    if(response.status===403)throw new DriveOnlyError('Conta sem permissão para esta base do Drive','FORBIDDEN');
    if(!response.ok)throw new DriveOnlyError('Falha do serviço autenticado ('+response.status+')','HTTP_ERROR');
    const contentType=String(response.headers?.get?.('content-type')||'');
    if(!contentType.includes('application/json'))throw new DriveOnlyError('Resposta não é JSON','INVALID_RESPONSE');
    let data;
    try{data=await response.json()}catch(e){throw new DriveOnlyError('Resposta JSON inválida','INVALID_RESPONSE')}
    if(!data||typeof data!=='object'||Array.isArray(data))throw new DriveOnlyError('Resposta não estruturada','INVALID_RESPONSE');
    return data;
  }
  /** Retorna autenticado=false sem simular que o GitHub possui base. */
  async session(){
    try {
      const s=await this.#request('/session');
      if(s.source!=='google-drive'||typeof s.authenticated!=='boolean')
        throw new DriveOnlyError('Sessão sem origem comprovada','INVALID_RESPONSE');
      return Object.freeze({authenticated:s.authenticated,source:s.source,
        lastSync:typeof s.lastSync==='string'?s.lastSync:null});
    }catch(e){if(e?.code==='LOGIN_REQUIRED')return Object.freeze({authenticated:false,source:'google-drive',lastSync:null});throw e}
  }
  async dataset(kind){
    if(!DATASETS.includes(kind))throw new DriveOnlyError('Tipo de acervo não autorizado','INVALID_KIND');
    const data=await this.#request('/data/'+kind);
    if(data.source!=='google-drive'||!Array.isArray(data.records)||
      typeof data.revision!=='string'||!data.revision)
      throw new DriveOnlyError('Catálogo sem proveniência Drive validada','INVALID_DATASET');
    if(data.count!==undefined&&(!Number.isSafeInteger(data.count)||data.count!==data.records.length))
      throw new DriveOnlyError('Quantidade inconsistente no catálogo','INVALID_DATASET');
    return Object.freeze({source:data.source,revision:data.revision,records:data.records});
  }
  async syncStatus(){
    const result=await this.#request('/sync/status');
    if(result.source!=='google-drive')throw new DriveOnlyError('Status de fonte inesperada','INVALID_RESPONSE');
    return result;
  }
  async signOut(){return this.#request('/logout',{method:'POST',body:{}})}
  // Um link só é fornecido pelo servidor após validar conta e lista permitida de IDs.
  mediaPath(mediaKey){
    if(typeof mediaKey!=='string'||!/^[A-Za-z0-9_-]{8,160}$/.test(mediaKey))
      throw new DriveOnlyError('Identificador de mídia inválido','INVALID_MEDIA');
    return this.base+'/media/'+encodeURIComponent(mediaKey);
  }
}
).test(base)||base.includes('//'))throw new TypeError('API somente no mesmo domínio');
    this.fetcher=fetcher;
    this.base=base;
  }
  async #request(path,{method='GET',body}={}) {
    const url=this.base+path;
    const options={
      method,credentials:'include',cache:'no-store',redirect:'error',
      headers:{'Accept':'application/json'}
    };
    if(body!==undefined) {
      options.headers['Content-Type']='application/json';
      options.body=JSON.stringify(body);
    }
    let response;
    try{response=await this.fetcher(url,options)}
    catch(e){throw new DriveOnlyError('Servidor de dados indisponível; nenhuma base pública substituída','UNAVAILABLE')}
    if(response.status===401)throw new DriveOnlyError('É necessário entrar na conta Google','LOGIN_REQUIRED');
    if(response.status===403)throw new DriveOnlyError('Conta sem permissão para esta base do Drive','FORBIDDEN');
    if(!response.ok)throw new DriveOnlyError('Falha do serviço autenticado ('+response.status+')','HTTP_ERROR');
    const contentType=String(response.headers?.get?.('content-type')||'');
    if(!contentType.includes('application/json'))throw new DriveOnlyError('Resposta não é JSON','INVALID_RESPONSE');
    let data;
    try{data=await response.json()}catch(e){throw new DriveOnlyError('Resposta JSON inválida','INVALID_RESPONSE')}
    if(!data||typeof data!=='object'||Array.isArray(data))throw new DriveOnlyError('Resposta não estruturada','INVALID_RESPONSE');
    return data;
  }
  /** Retorna autenticado=false sem simular que o GitHub possui base. */
  async session(){
    try {
      const s=await this.#request('/session');
      if(s.source!=='google-drive'||typeof s.authenticated!=='boolean')
        throw new DriveOnlyError('Sessão sem origem comprovada','INVALID_RESPONSE');
      return Object.freeze({authenticated:s.authenticated,source:s.source,
        lastSync:typeof s.lastSync==='string'?s.lastSync:null});
    }catch(e){if(e?.code==='LOGIN_REQUIRED')return Object.freeze({authenticated:false,source:'google-drive',lastSync:null});throw e}
  }
  async dataset(kind){
    if(!DATASETS.includes(kind))throw new DriveOnlyError('Tipo de acervo não autorizado','INVALID_KIND');
    const data=await this.#request('/data/'+kind);
    if(data.source!=='google-drive'||!Array.isArray(data.records)||
      typeof data.revision!=='string'||!data.revision)
      throw new DriveOnlyError('Catálogo sem proveniência Drive validada','INVALID_DATASET');
    if(data.count!==undefined&&(!Number.isSafeInteger(data.count)||data.count!==data.records.length))
      throw new DriveOnlyError('Quantidade inconsistente no catálogo','INVALID_DATASET');
    return Object.freeze({source:data.source,revision:data.revision,records:data.records});
  }
  async syncStatus(){
    const result=await this.#request('/sync/status');
    if(result.source!=='google-drive')throw new DriveOnlyError('Status de fonte inesperada','INVALID_RESPONSE');
    return result;
  }
  async signOut(){return this.#request('/logout',{method:'POST',body:{}})}
  // Um link só é fornecido pelo servidor após validar conta e lista permitida de IDs.
  mediaPath(mediaKey){
    if(typeof mediaKey!=='string'||!/^[A-Za-z0-9_-]{8,160}$/.test(mediaKey))
      throw new DriveOnlyError('Identificador de mídia inválido','INVALID_MEDIA');
    return this.base+'/media/'+encodeURIComponent(mediaKey);
  }
}
