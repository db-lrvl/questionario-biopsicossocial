"use client";

import { useMemo, useState } from "react";

type ReportSubmission = {
  id: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
  answers_count: number;
};

type ReportReferral = {
  submission_id: string;
  section_key: string;
  referral_notes: string | null;
};

type ReportData = {
  totalSubmissions: number;
  submissions: ReportSubmission[];
  referrals: ReportReferral[];
  csv: string;
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: ReportData }
  | { status: "error"; message: string };

export function ReportDashboard() {
  const [password, setPassword] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  const csvUrl = useMemo(() => {
    if (state.status !== "ready") {
      return null;
    }

    return URL.createObjectURL(new Blob([state.data.csv], { type: "text/csv;charset=utf-8" }));
  }, [state]);

  async function loadReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading" });

    const response = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = (await response.json().catch(() => null)) as ReportData & { error?: string };

    if (!response.ok) {
      setState({ status: "error", message: data?.error || "Não foi possível carregar o relatório." });
      return;
    }

    setState({ status: "ready", data });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={loadReport} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Acesso ao relatório</h2>
        <p className="mt-1 text-sm text-slate-600">
          A senha é enviada somente para a API de relatório e não é armazenada no navegador.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha administrativa"
            required
          />
          <button
            className="rounded-lg bg-slate-950 px-5 py-2 font-medium text-white disabled:opacity-60"
            disabled={state.status === "loading"}
          >
            {state.status === "loading" ? "Carregando..." : "Carregar"}
          </button>
        </div>
      </form>

      {state.status === "error" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {state.message}
        </div>
      ) : null}

      {state.status === "ready" ? (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Submissões</p>
              <p className="mt-2 text-3xl font-semibold">{state.data.totalSubmissions}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Encaminhamentos</p>
              <p className="mt-2 text-3xl font-semibold">{state.data.referrals.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Exportação</p>
              {csvUrl ? (
                <a className="mt-3 inline-block font-medium text-slate-950 underline" href={csvUrl} download="submissoes.csv">
                  Baixar CSV
                </a>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Últimas submissões</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Criada em</th>
                    <th className="py-2 pr-4">Respostas</th>
                  </tr>
                </thead>
                <tbody>
                  {state.data.submissions.map((submission) => (
                    <tr key={submission.id} className="border-t border-slate-100">
                      <td className="py-2 pr-4 font-mono text-xs">{submission.id}</td>
                      <td className="py-2 pr-4">{submission.status}</td>
                      <td className="py-2 pr-4">{new Date(submission.created_at).toLocaleString("pt-BR")}</td>
                      <td className="py-2 pr-4">{submission.answers_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Encaminhamentos</h2>
            <div className="mt-4 space-y-3">
              {state.data.referrals.length === 0 ? (
                <p className="text-sm text-slate-600">Nenhum encaminhamento registrado.</p>
              ) : (
                state.data.referrals.map((referral) => (
                  <div key={`${referral.submission_id}-${referral.section_key}`} className="rounded-xl bg-slate-50 p-3 text-sm">
                    <p className="font-medium">{referral.section_key}</p>
                    <p className="mt-1 text-slate-600">{referral.referral_notes || "Sem observação."}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
