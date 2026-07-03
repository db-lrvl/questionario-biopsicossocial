# Questionário Biopsicossocial

Protótipo informal em Next.js para coleta de respostas do Questionário Padronizado para Avaliação Biopsicossocial.

## Stack

- Next.js App Router
- Supabase Postgres
- API routes server-side
- Formulário dinâmico baseado em schema TypeScript

## Requisitos

- Node.js 22 ou superior
- npm
- Projeto Supabase com Data API habilitada e RLS habilitado

## Configuração local

Crie `.env.local` com base em `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FORM_ACCESS_TOKEN=
ADMIN_REPORT_PASSWORD=
```

`SUPABASE_SERVICE_ROLE_KEY` nunca deve ser exposta em código client-side ou variáveis `NEXT_PUBLIC_*`.

## Banco de dados

Execute o SQL em `supabase/migrations/001_initial_schema.sql` no Supabase SQL Editor.

As tabelas têm RLS habilitado e não recebem políticas públicas. As escritas e leituras do protótipo passam pelas API routes do Next.js usando a service role key no servidor.

## Rotas

- `/` página inicial
- `/formulario?token=SEU_CODIGO` formulário público com código simples
- `/relatorio` relatório protegido por `ADMIN_REPORT_PASSWORD`
- `/api/submissions` submissão do formulário
- `/api/report` dados do relatório e CSV

## Encerramento da coleta

Ao final, troque ou remova `FORM_ACCESS_TOKEN`, remova as variáveis na Vercel ou tire o deploy do ar.
