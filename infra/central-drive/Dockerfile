# Homologação privada, a partir da raiz do checkout. Não publicar a imagem.
FROM node:22-bookworm-slim
WORKDIR /app
COPY --chown=node:node assets/ ./assets/
COPY --chown=node:node index.html controle-estudos-v245.html ./
COPY --chown=node:node infra/central-drive/ ./infra/central-drive/
USER node
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
RUN node infra/central-drive/preflight.mjs --local
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","infra/central-drive/server.mjs"]
