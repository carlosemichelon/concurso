#!/usr/bin/env python3
"""Portão privado: executar localmente sobre snapshot e ponteiro; nunca enviar dados privados ao GitHub.
Uso: python tools/check_private_closure.py BASE.json PONTEIRO.json"""
import sys,json,hashlib,re,collections
from pathlib import Path
def main():
 p=Path(sys.argv[1]); b=json.loads(p.read_text(encoding='utf-8-sig')); ptr=json.loads(Path(sys.argv[2]).read_text(encoding='utf-8-sig')); errors=[]; warnings=[]
 def ck(ok,msg):
  if not ok: errors.append(msg)
 c={x['id']:x for x in b['cards']}; q={x.get('qid') or x.get('ID') or x.get('id'):x for x in b['questions']}; m={x['id']:x for x in b['images']}; s={x['id']:x for x in b['srs']}
 for k,obj,raw in [('cards',c,b['cards']),('questions',q,b['questions']),('images',m,b['images']),('srs_records',s,b['srs'])]:
  ck(len(obj)==len(raw)==b['counts'][k],k+' divergência de contagem ou ID duplicado')
 ck(None not in q,'questão sem identificador')
 active=[x for x in c.values() if x.get('active')]
 ck(len(active)==b['counts']['evolutive_eligible'],'contagem de ativos divergente')
 for x in active:
  layers=x.get('evolutive',{}).get('layers',[])
  ck(len(layers)==11 and all(z.get('ord')==i+1 and z.get('titulo') and str(z.get('texto','')).strip() for i,z in enumerate(layers)),x['id']+' módulos inválidos')
 for i,x in c.items():
  for r in x.get('related_card_ids',[]):ck(r in c and i in c[r].get('related_card_ids',[]),i+' relação não recíproca '+r)
 for i,x in m.items():
  for r in x.get('card_ids',[]):ck(r in c,i+' mídia aponta para cartão inexistente '+r)
 for i,x in q.items():
  for r in x.get('cards',[]):ck(r in c,i+' questão aponta para cartão inexistente '+r)
 for i,x in s.items():
  ck(i in c,'SRS aponta para cartão inexistente '+i)
  grade=x.get('grade');date=x.get('last_date')
  ck(not (re.fullmatch(r'\d{4}-\d{2}-\d{2}',str(grade)) and date in ['Errei','Difícil','Bom','Fácil']),'SRS com classificação/data invertidas '+i)
 missing=[x['id'] for x in active if x['id'] not in s]
 if missing:warnings.append({'active_missing_srs':missing})
 ck(ptr['private_base']['version']==b['version'],'versão privada difere do ponteiro')
 ck(ptr['private_base']['sha256']==hashlib.sha256(p.read_bytes()).hexdigest(),'SHA256 divergente')
 print(json.dumps({'version':b['version'],'counts':b['counts'],'errors':errors,'warnings':warnings,'pending':ptr.get('remaining_limits',[]),'conformidade_integral':not errors and not warnings and not ptr.get('remaining_limits')},ensure_ascii=False,indent=2))
 return 1 if errors else 0
if __name__=='__main__':sys.exit(main())
