/* Banco Mestre V2 — leitura limitada de bytes privados sem escrita/persistência.
 * A autorização é gerida pelo DriveReadonly. Nenhum token é salvo aqui.
 */
export const MAX_DRIVE_PDF_BYTES=120_000_000;
export const MAX_DRIVE_IMAGE_BYTES=15_000_000;
const SIGNATURE=[37,80,68,70,45]; // %PDF-
export function driveApiFileUrl(url){
  let parsed;
  try{parsed=new URL(String(url||''))}catch{return false}
  return parsed.protocol==='https:'&&parsed.origin==='https://www.googleapis.com'&&
    /^\/drive\/v3\/files(?:\/[A-Za-z0-9_-]{10,200})?$/.test(parsed.pathname)&&
    !parsed.username&&!parsed.password&&!parsed.hash;
}
export async function boundedMediaBytes(response,{maxBytes,signal}={}){
  if(!response||!Number.isInteger(maxBytes)||maxBytes<1||maxBytes>MAX_DRIVE_PDF_BYTES)
    throw Error('Limite da leitura privada inválido');
  if(signal?.aborted)throw new DOMException('Download cancelado','AbortError');
  const declared=Number(response.headers?.get?.('content-length')||0);
  if(Number.isFinite(declared)&&declared>maxBytes)throw Error('Arquivo excede o limite de '+maxBytes+' bytes');
  const chunks=[];let total=0;
  if(response.body?.getReader){
    const reader=response.body.getReader();
    try{
      while(true){
        if(signal?.aborted)throw new DOMException('Download cancelado','AbortError');
        const {done,value}=await reader.read();
        if(done)break;
        if(!(value instanceof Uint8Array))throw Error('Resposta binária inesperada');
        total+=value.byteLength;
        if(total>maxBytes)throw Error('Download interrompido: limite de '+maxBytes+' bytes excedido');
        chunks.push(value);
      }
    }catch(e){try{await reader.cancel()}catch(_){}throw e}
    finally{try{reader.releaseLock()}catch(_){}}
  }else{
    const bytes=new Uint8Array(await response.arrayBuffer());
    total=bytes.byteLength;
    if(total>maxBytes)throw Error('Arquivo excede limite de '+maxBytes+' bytes');
    chunks.push(bytes);
  }
  if(signal?.aborted)throw new DOMException('Download cancelado','AbortError');
  const output=new Uint8Array(total);
  let offset=0;for(const chunk of chunks){output.set(chunk,offset);offset+=chunk.byteLength}
  return output.buffer;
}
export async function boundedPdfBytes(response,{signal}={}){
  const mime=String(response?.headers?.get?.('content-type')||'').split(';')[0].trim().toLowerCase();
  if(mime&&!['application/pdf','application/octet-stream','binary/octet-stream'].includes(mime))
    throw Error('Drive respondeu formato que não é PDF');
  const buffer=await boundedMediaBytes(response,{maxBytes:MAX_DRIVE_PDF_BYTES,signal});
  if(buffer.byteLength<5||!SIGNATURE.every((byte,i)=>new Uint8Array(buffer)[i]===byte))
    throw Error('Arquivo do Drive não contém assinatura PDF válida');
  return buffer;
}
