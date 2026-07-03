"use client";

import { useMemo, useState } from "react";
import { questionnaire } from "@/lib/form-schema/questionnaire";
import { isQuestionVisible } from "@/lib/form-schema/conditions";
import type { AnswerMap, AnswerValue, Question } from "@/lib/form-schema/types";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; submissionId: string }
  | { status: "error"; message: string };

type Props = {
  initialAccessToken?: string;
};

function normalizeInputValue(question: Question, formValue: string, checked: boolean, current: AnswerValue) {
  if (question.type === "checkbox") {
    const values = Array.isArray(current) ? current : [];
    return checked ? [...values, formValue] : values.filter((value) => value !== formValue);
  }

  if (question.type === "number") {
    return formValue === "" ? "" : Number(formValue);
  }

  return formValue;
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}) {
  const baseId = `question-${question.key}`;
  const commonClassName =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200";

  if (question.type === "textarea") {
    return (
      <textarea
        id={baseId}
        className={commonClassName}
        rows={4}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (question.type === "radio" || question.type === "boolean") {
    return (
      <div className="mt-3 grid gap-2">
        {question.options?.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <input
              type="radio"
              name={question.key}
              value={option.value}
              checked={value === option.value}
              onChange={(event) => onChange(event.target.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "checkbox") {
    const values = Array.isArray(value) ? value : [];

    return (
      <div className="mt-3 grid gap-2">
        {question.options?.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              value={option.value}
              checked={values.includes(option.value)}
              onChange={(event) =>
                onChange(normalizeInputValue(question, option.value, event.target.checked, value))
              }
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "select") {
    return (
      <select
        id={baseId}
        className={commonClassName}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Selecione</option>
        {question.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      id={baseId}
      className={commonClassName}
      type={question.type === "number" ? "number" : "text"}
      value={String(value ?? "")}
      onChange={(event) =>
        onChange(normalizeInputValue(question, event.target.value, event.target.checked, value))
      }
    />
  );
}

export function DynamicQuestionnaireForm({ initialAccessToken = "" }: Props) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [accessToken, setAccessToken] = useState(initialAccessToken);
  const [honeypot, setHoneypot] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const visibleSections = useMemo(
    () =>
      questionnaire.sections
        .map((section) => ({
          ...section,
          questions: section.questions.filter((question) => isQuestionVisible(question, answers)),
        }))
        .filter((section) => section.questions.length > 0),
    [answers],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "submitting" });

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, honeypot, answers }),
    });

    const data = (await response.json().catch(() => null)) as
      | { submissionId?: string; error?: string }
      | null;

    if (!response.ok) {
      setSubmitState({
        status: "error",
        message: data?.error || "Não foi possível enviar o formulário.",
      });
      return;
    }

    setSubmitState({ status: "success", submissionId: data?.submissionId || "" });
  }

  if (submitState.status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
        <h2 className="text-xl font-semibold">Formulário enviado</h2>
        <p className="mt-2 text-sm">
          A submissão foi registrada com sucesso. Identificador:{" "}
          <span className="font-mono">{submitState.submissionId}</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
        <h2 className="font-semibold">Acesso ao formulário</h2>
        <p className="mt-1 text-sm">
          Use o código enviado junto com o link. Ele é validado novamente no servidor.
        </p>
        <input
          className="mt-3 w-full rounded-lg border border-amber-300 bg-white px-3 py-2"
          type="password"
          value={accessToken}
          onChange={(event) => setAccessToken(event.target.value)}
          placeholder="Código de acesso"
          required
        />
        <label className="sr-only" htmlFor="website">
          Website
        </label>
        <input
          id="website"
          name="website"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </section>

      {visibleSections.map((section) => (
        <section key={section.key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
          <div className="mt-5 space-y-5">
            {section.questions.map((question) => (
              <div
                key={question.key}
                className={
                  question.institutional
                    ? "rounded-xl border border-sky-200 bg-sky-50 p-4"
                    : "rounded-xl border border-slate-100 bg-slate-50 p-4"
                }
              >
                <label htmlFor={`question-${question.key}`} className="block text-sm font-medium text-slate-900">
                  {question.number ? `${question.number}. ` : ""}
                  {question.label}
                  {question.required ? <span className="text-red-600"> *</span> : null}
                </label>
                {question.helperText ? (
                  <p className="mt-1 text-xs text-slate-600">{question.helperText}</p>
                ) : null}
                <QuestionField
                  question={question}
                  value={answers[question.key] ?? ""}
                  onChange={(nextValue) =>
                    setAnswers((current) => ({ ...current, [question.key]: nextValue }))
                  }
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      {submitState.status === "error" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {submitState.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitState.status === "submitting"}
        className="rounded-full bg-slate-950 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitState.status === "submitting" ? "Enviando..." : "Enviar formulário"}
      </button>
    </form>
  );
}
