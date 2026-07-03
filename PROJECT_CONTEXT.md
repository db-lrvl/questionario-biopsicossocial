# Project Context for Fresh Agents

Este arquivo e o ponto de handoff para agentes novos trabalhando no projeto
`questionario-biopsicossocial`. Atualize este documento sempre que mudar
arquitetura, deploy, banco, variaveis de ambiente, fluxo de dados, decisoes de
seguranca ou status do projeto.

## Objetivo do Projeto

Protótipo informal de uma página web pública para menos de 30 pessoas conhecidas
preencherem um Questionário Padronizado para Avaliação Biopsicossocial.

O projeto não tem login nem perfil de usuário. A proteção é propositalmente
simples, adequada para uso curto e controlado:

- token/código simples para acesso ao formulário;
- senha simples para acesso ao relatório;
- honeypot;
- rate limit básico por IP;
- validação server-side;
- dados gravados no Supabase via API server-side.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Vercel para hospedagem
- Supabase Postgres para banco
- Supabase Data API com `@supabase/supabase-js`
- `zod` para validação server-side

## Ambientes e Repositórios

- Pasta local: `/Users/daianebushey/dev/questionario-biopsicossocial`
- GitHub: `https://github.com/db-lrvl/questionario-biopsicossocial.git`
- Branch principal: `main`
- Node local esperado: 22 ou superior
- Arquivos de versão Node:
  - `.nvmrc`
  - `package.json` com `engines.node >=22.0.0`

## Deploy e Hospedagem

O código é versionado no GitHub e publicado pela Vercel.

Fluxo:

```txt
GitHub -> Vercel -> Next.js app publico
                    -> API routes server-side
                    -> Supabase Postgres
```

O projeto foi criado/importado na Vercel com nome visto pela usuária como
`db_qbiopsi`. A URL final deve ser confirmada no dashboard da Vercel em
`Project -> Domains` ou `Deployments -> latest -> Visit`.

## Variáveis de Ambiente

Existem no `.env.local` localmente e devem existir também na Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FORM_ACCESS_TOKEN=
ADMIN_REPORT_PASSWORD=
```

Regras:

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` podem ser usados
  no navegador.
- `SUPABASE_SERVICE_ROLE_KEY` nunca deve ir para código client-side nem para
  variáveis `NEXT_PUBLIC_*`.
- `.env.local` é ignorado pelo Git e não deve ser commitado.
- `FORM_ACCESS_TOKEN` deve preferencialmente ser URL-safe, sem `+` ou `/`, para
  evitar problemas quando usado em query string.

## Estrutura de Pastas

```txt
app/
  page.tsx
  formulario/page.tsx
  relatorio/page.tsx
  api/submissions/route.ts
  api/report/route.ts

components/
  form/DynamicQuestionnaireForm.tsx
  report/ReportDashboard.tsx

lib/
  form-schema/
    questionnaire.ts
    conditions.ts
    types.ts
  security/
    access.ts
    rate-limit.ts
  supabase/
    server.ts
  validation/
    submission.ts

supabase/
  migrations/
    001_initial_schema.sql
    002_grant_service_role_access.sql
```

## Principais Arquivos

`app/page.tsx`
- Landing page do protótipo.
- Linka para formulário e relatório.

`app/formulario/page.tsx`
- Página do formulário.
- Lê `token` de `searchParams`.
- Passa token inicial para o componente client.

`components/form/DynamicQuestionnaireForm.tsx`
- Renderiza formulário dinâmico.
- Mostra/esconde perguntas conforme condicionais.
- Envia `POST /api/submissions`.
- Inclui honeypot.

`lib/form-schema/questionnaire.ts`
- Schema TypeScript inicial do questionário.
- Contém seções, perguntas, opções, condicionais, flags sensíveis e flags
  institucionais.
- Importante: ainda é MVP, não transcrição 100% completa do PDF.

`lib/form-schema/conditions.ts`
- Avalia condicionais de perguntas.

`lib/validation/submission.ts`
- Valida payload com `zod`.
- Bloqueia perguntas desconhecidas.
- Ignora respostas de perguntas não visíveis.
- Confere obrigatórios visíveis.

`app/api/submissions/route.ts`
- Endpoint de submissão.
- Valida rate limit, payload, honeypot e `FORM_ACCESS_TOKEN`.
- Faz upsert do catálogo do questionário.
- Grava `submissions`, `answers`, `referrals` e
  `institutional_classifications`.
- Loga erro Supabase no servidor sem expor segredo ao usuário.

`app/api/report/route.ts`
- Endpoint do relatório.
- Valida `ADMIN_REPORT_PASSWORD`.
- Retorna total de submissões, últimas submissões, encaminhamentos e CSV.
- CSV já foi ajustado para evitar aspas JSON duplicadas em strings simples.

`lib/supabase/server.ts`
- Cria cliente Supabase server-side com `SUPABASE_SERVICE_ROLE_KEY`.

`supabase/migrations/001_initial_schema.sql`
- Cria tabelas, índices e habilita RLS.
- Não cria policies públicas.

`supabase/migrations/002_grant_service_role_access.sql`
- Concede privilégios SQL para `service_role`.
- Foi necessário porque a submissão falhava com:
  `permission denied for table questionnaires`.

## Banco de Dados

Tabelas:

- `questionnaires`
- `questionnaire_sections`
- `questions`
- `submissions`
- `answers`
- `referrals`
- `institutional_classifications`

Modelo:

- O catálogo do questionário fica em `questionnaires`, `questionnaire_sections`
  e `questions`.
- Cada envio gera uma linha em `submissions`.
- Cada resposta gera uma linha em `answers`, com `value jsonb`.
- Encaminhamentos ficam em `referrals`.
- Avaliações institucionais ficam em `institutional_classifications`.

RLS:

- RLS está habilitado em todas as tabelas.
- Não há policies públicas.
- As APIs do Next usam `service_role` no servidor.

## Fluxo do Formulário

```txt
Respondente
-> /formulario?token=FORM_ACCESS_TOKEN
-> preenche respostas
-> POST /api/submissions
-> valida token/honeypot/rate limit/payload
-> grava no Supabase
```

Se o token tiver caracteres como `+` ou `/`, prefira trocar por valor URL-safe.

## Fluxo do Relatório

```txt
Avaliador
-> /relatorio
-> digita ADMIN_REPORT_PASSWORD
-> POST /api/report
-> API le Supabase
-> mostra contagens, encaminhamentos e CSV
```

## Status Confirmado

- GitHub conectado e com código visível.
- Supabase criado.
- Migrations `001` e `002` rodadas no Supabase.
- Submissão local testada com sucesso.
- Identificador de teste confirmado:
  `2853815c-b488-411c-a83f-4eeceaf0ee1d`.
- Relatório local testado.
- CSV exportado e conferido.
- Vercel importou/deployou o projeto; URL final deve ser confirmada no
  dashboard.

## Comandos Úteis

Instalar/usar Node correto:

```bash
nvm use
```

Desenvolvimento local:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Start de produção local depois do build:

```bash
npm run start
```

Parar servidor no terminal:

```bash
Ctrl+C
```

Se porta 3000 travar:

```bash
lsof -ti tcp:3000 | xargs kill
```

## Riscos e Limitações Conhecidas

- O schema do formulário é MVP. Falta revisar o PDF inteiro e completar campo a
  campo.
- A proteção por token/senha é básica, sem autenticação real.
- Rate limit em memória é limitado em ambiente serverless.
- Dados são sensíveis; manter repo privado se possível e nunca expor service
  role.
- Ao final da coleta, trocar/remover `FORM_ACCESS_TOKEN` ou tirar deploy do ar.

## Próximas Tarefas Prováveis

1. Confirmar URL pública final da Vercel.
2. Testar produção:
   - `/`
   - `/formulario?token=...`
   - `/relatorio`
   - CSV
3. Revisar variáveis de ambiente na Vercel.
4. Completar schema contra o PDF original.
5. Melhorar relatório para leitura humana.
6. Definir procedimento de encerramento da coleta.

## Instruções Para Agentes

- Antes de editar código Next.js, leia `AGENTS.md`.
- Como o projeto usa Next.js 16, consulte docs locais em
  `node_modules/next/dist/docs/` quando mexer em APIs, App Router, route
  handlers ou comportamento de build.
- Não exponha valores de `.env.local`.
- Não faça commit/push sem pedido explícito.
- Se mudar arquitetura, banco, deploy, variáveis, rotas, riscos ou status,
  atualize este arquivo.
- Preserve a simplicidade do MVP. O objetivo atual é protótipo publicado para
  crítica de colaboradores; refinos podem vir depois.
