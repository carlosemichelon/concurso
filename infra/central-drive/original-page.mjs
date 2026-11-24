import {readFile} from 'node:fs/promises';
// Derive the private page from the real index, never from the homologation UI.
// Only exact original CSS links and the audited core are served. The remaining
// legacy scripts stay in index.html unchanged until their data paths are isolated.
export async function originalPage(){
 const source=await readFile(new URL('../../index.html',import.meta.url),'utf8');
 if(!source.includes('data-bm-portal-version="V348"'))throw Error('Versão original ainda não auditada');
 const styles=[...source.matchAll(/<link rel="stylesheet" href="assets\/([A-Za-z0-9_.-]+\.css)(?:\?[^"]*)?">/g)].map(m=>m[1]);
 styles.push('v108_grifos_editor.css','v120_grifos_paragrafos.css','v100_pdf_tools.css');const allowed=new Set(styles);
 let html=source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/href="assets\/([A-Za-z0-9_.-]+\.css)(?:\?[^"]*)?"/g,(_,name)=>'href="/portal-style/'+name+'"');
 html=html.replace('</head>','<link rel="stylesheet" href="/portal-style/v108_grifos_editor.css"><link rel="stylesheet" href="/portal-style/v120_grifos_paragrafos.css"><link rel="stylesheet" href="/portal-style/v100_pdf_tools.css"></head>').replace('<body>','<body hidden>').replace('</body>','<script src="/original-session.js" defer></script></body>');
 html=html.replace('Portal V348 · Banco Mestre · leitura contínua','Portal V348 · ambiente individual').replace('Conectar Drive</button>','Sair</button>').replace('Preparando conexão segura…','Validando perfil…');
 html=html.replace(/<details id="bm273Versoes"[\s\S]*?<\/details>/,'<details id="bm273Versoes" class="notice"><summary>Catálogo individual</summary><p>Somente o catálogo do perfil autenticado. Consulta sem alteração do SRS.</p></details>');
 html=html.replace(/<footer>[\s\S]*?<\/footer>/,'<footer>Portal V348 original — integração privada em homologação. Recursos ainda não isolados permanecem bloqueados.</footer>');
 html=html.replace('A biblioteca privada consulta os PDFs originais no Google Drive após sua autorização. As marcações e os originais permanecem preservados; guias importados do computador continuam locais.','A biblioteca consulta exclusivamente os documentos do seu perfil no Drive central. Originais preservados.');
 html=html.replace('Se a imagem completa não estiver disponível, vincule seu original ao registro. Ele será guardado somente neste navegador.','Imagens originais consultadas no Drive central. Anotações visuais ainda em homologação.');
 if(!html.includes('id="cardRows"')||!html.includes('id="imageDialog"')||!html.includes('id="pdfDialog"')||!html.includes('<body hidden>'))throw Error('Estrutura original divergente');
 return {html,styles:allowed};
}
export async function originalStyle(name){const page=await originalPage();if(!page.styles.has(name))return null;return readFile(new URL('../../assets/'+name,import.meta.url))}
