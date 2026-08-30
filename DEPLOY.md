# Deploy no Render

Este projeto sobe como **um único serviço Web (Node)** no Render: o mesmo
servidor Express que expõe a API (`/api/*`) também serve os arquivos
estáticos do build do frontend (pasta `dist/`). Não há necessidade de dois
serviços separados (frontend + backend).

Os dados (usuários com senha em hash) continuam sendo persistidos em um
arquivo JSON no servidor (`server/data/users.json`), sem banco de dados —
por isso é necessário um **disco persistente** no Render, já que o
sistema de arquivos padrão dos serviços Web é efêmero (é apagado a cada
novo deploy ou reinício).

## Configuração no painel do Render

Ao criar o "Web Service" a partir deste repositório:

- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Environment:** Node

O Render define a variável `PORT` automaticamente — o servidor já lê essa
variável (`server.ts`) e escuta nela, então nenhuma ação é necessária aqui.

## Variáveis de ambiente a configurar manualmente

Nenhuma delas pode ficar no repositório (o `.gitignore` já bloqueia
arquivos `.env`). Configure-as em **Environment → Environment Variables**
no painel do serviço no Render:

| Variável     | Obrigatória | Descrição |
|--------------|-------------|-----------|
| `JWT_SECRET` | Sim         | Chave usada para assinar os tokens de login (JWT). Use um valor longo e aleatório, diferente do exemplo em `.env.example`. Se não for definida, o servidor usa uma chave padrão insegura — **nunca rode em produção sem configurar esta variável**. |
| `DATA_DIR`   | Recomendada | Caminho absoluto onde o arquivo `users.json` é gravado. Deve apontar para o *mount path* do disco persistente (veja abaixo). Sem essa variável, os dados são gravados em `server/data` dentro do próprio projeto, o que só persiste entre deploys se o disco for montado exatamente nesse caminho. |
| `PORT`       | Não         | Definida automaticamente pelo Render. Não sobrescreva. |
| `NODE_ENV`   | Não         | O script `npm start` já define `NODE_ENV=production`; não é preciso configurar no painel. |

## Disco persistente

1. No painel do serviço, vá em **Disks** e adicione um disco (ex: 1 GB já é suficiente).
2. Defina o **Mount Path** como `/var/data` (ou outro caminho de sua preferência).
3. Configure a variável de ambiente `DATA_DIR=/var/data` (mesmo valor do mount path).
4. Faça o deploy. Na primeira inicialização, o servidor cria a pasta e o
   arquivo `users.json` automaticamente nesse disco, já populado com os
   usuários de demonstração (senha padrão `agencia123` — troque assim que
   possível em "Gerenciar Equipe").

Sem esse disco configurado, o serviço continua funcionando normalmente,
mas qualquer usuário criado ou senha alterada é perdido no próximo deploy
ou reinício do serviço.
