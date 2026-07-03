import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">
          Protótipo informal
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Questionário Padronizado para Avaliação Biopsicossocial
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Página pública sem login, protegida por código simples, com envio server-side para
          Supabase e relatório restrito para avaliação posterior.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/formulario"
            className="rounded-full bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
          >
            Abrir formulário
          </Link>
          <Link
            href="/relatorio"
            className="rounded-full border border-slate-300 px-5 py-3 font-medium text-slate-900 transition hover:bg-white"
          >
            Área de relatório
          </Link>
        </div>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["Acesso simples", "Código no link ou campo, validado novamente na API."],
            ["Dados sensíveis", "Service role key fica somente no servidor, nunca no navegador."],
            ["Encerramento fácil", "Ao fim da coleta, troque o token ou tire o deploy do ar."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
