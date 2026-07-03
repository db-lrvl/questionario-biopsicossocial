import Link from "next/link";
import { ReportDashboard } from "@/components/report/ReportDashboard";

export default function RelatorioPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-950">
          Voltar
        </Link>
        <header className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
            Relatório
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Acompanhamento das submissões
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Área simples para contagem de respostas, encaminhamentos e exportação CSV. Use apenas
            durante o período curto de coleta.
          </p>
        </header>

        <div className="mt-8">
          <ReportDashboard />
        </div>
      </div>
    </main>
  );
}
