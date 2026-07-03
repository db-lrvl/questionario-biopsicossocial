import Link from "next/link";
import { DynamicQuestionnaireForm } from "@/components/form/DynamicQuestionnaireForm";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FormularioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;
  const initialAccessToken = Array.isArray(token) ? token[0] : token;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-950">
          Voltar
        </Link>
        <header className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
            Formulário
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Avaliação biopsicossocial
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Preencha as perguntas aplicáveis. Campos condicionais aparecem conforme as respostas
            anteriores. Evite compartilhar o link publicamente.
          </p>
        </header>

        <div className="mt-8">
          <DynamicQuestionnaireForm initialAccessToken={initialAccessToken ?? ""} />
        </div>
      </div>
    </main>
  );
}
