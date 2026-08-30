# Deploy na Vercel + Supabase

A publicação passa a ser feita na **Vercel**, com o banco de dados e a
autenticação geridos pelo **Supabase** (Postgres + Supabase Auth). Não há
mais um servidor Express contínuo: o frontend (Vite) fala direto com o
Supabase pelo client SDK, protegido por Row Level Security, e a Vercel
publica um site estático + um punhado de funções serverless (pasta `api/`)
usadas só para as ações administrativas que exigem a chave secreta do
Supabase.

## Visão geral da arquitetura

- **Frontend (Vite/React)**: build estático publicado pela Vercel. Fala
  direto com o Supabase (login, ler/criar/editar demandas, clientes,
  etapas, apontamentos) usando a chave pública (anon key). O Row Level
  Security do banco garante que só usuário autenticado acesse os dados.
- **`api/team-members/*` (funções serverless da Vercel)**: as únicas rotas
  de servidor que restam. Usadas apenas para criar membro da equipe,
  remover membro da equipe e redefinir a senha de outra pessoa — ações que
  precisam da **service role key** do Supabase (que ignora as permissões
  normais do usuário logado) e por isso nunca podem rodar no navegador.
- **Supabase**: banco Postgres (tabelas `usuarios`, `clientes`, `etapas`,
  `demandas`, `checklist_items`, `comentarios`, `historico`,
  `apontamentos`) e Supabase Auth (login por email/senha).

## Configuração no painel da Vercel

Ao importar este repositório como um novo projeto:

- **Framework Preset:** Vite (detectado automaticamente)
- **Build Command:** `npm run build` (roda `vite build`)
- **Output Directory:** `dist`
- A pasta `api/` é publicada automaticamente como funções serverless —
  nenhuma configuração extra é necessária para isso.

## Variáveis de ambiente a configurar manualmente

Nenhuma delas pode ficar no repositório — configure em **Settings →
Environment Variables** no painel do projeto na Vercel. Os valores reais
ficam em **Project Settings → API** no painel do Supabase.

| Variável | Obrigatória | Onde é usada | Descrição |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Sim | Frontend e rotas `/api` | Project URL do Supabase. Pública. |
| `VITE_SUPABASE_ANON_KEY` | Sim | Frontend | Chave anônima/pública do Supabase. Pública — a segurança vem do RLS, não do sigilo dela. |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Só dentro de `api/team-members/*` | **Secreta.** Nunca use o prefixo `VITE_` nela — isso a exporia no bundle do navegador. |

O prefixo `VITE_` é o que faz o Vite incluir uma variável no código do
frontend; por isso as duas primeiras o usam e a terceira nunca deve usá-lo.

## Configuração no Supabase

1. Crie um projeto Supabase dedicado a este sistema (não reaproveite um
   projeto pessoal ou de outro contexto).
2. As tabelas, o Row Level Security e os usuários de demonstração já foram
   criados durante a migração deste projeto. Para um projeto novo do zero,
   é necessário recriar esse schema (tabelas + policies de RLS) antes do
   primeiro deploy.
3. Em **Authentication → Providers**, o provedor de Email/Senha já vem
   habilitado por padrão.
4. Opcional, recomendado: em **Authentication → Policies → Password
   Security**, habilite a proteção contra senhas vazadas
   (HaveIBeenPwned).

## Primeiro acesso

Os usuários de demonstração (senha `agencia123`) foram criados durante a
migração — troque essa senha em produção assim que possível (em
Gerenciar Equipe → editar membro → redefinir senha, ou pelo próprio
usuário). Para adicionar mais pessoas à equipe, use "Gerenciar Equipe" no
próprio sistema (isso já passa pelas rotas `/api/team-members`).

## O que não muda

O modelo de dados continua o mesmo (Postgres via Supabase); nada em
layout, cores ou textos foi alterado nesta migração.
