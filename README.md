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
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
