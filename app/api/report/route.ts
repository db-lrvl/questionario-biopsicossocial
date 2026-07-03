import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isValidAdminPassword } from "@/lib/security/access";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function answerValueForCsv(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value === null || value === undefined) {
    return "";
  }

  return JSON.stringify(value);
}

function buildCsv(
  answers: Array<{
    submission_id: string;
    section_key: string;
    question_key: string;
    value: unknown;
    created_at: string;
  }>,
) {
  const rows = [
    ["submission_id", "section_key", "question_key", "value", "created_at"],
    ...answers.map((answer) => [
      answer.submission_id,
      answer.section_key,
      answer.question_key,
      answerValueForCsv(answer.value),
      answer.created_at,
    ]),
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`report:${ip}`);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;

  if (!body?.password || !isValidAdminPassword(body.password)) {
    return NextResponse.json({ error: "Senha inválida." }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("id,status,submitted_at,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (submissionsError) {
    return NextResponse.json({ error: "Não foi possível carregar submissões." }, { status: 500 });
  }

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("submission_id,section_key,question_key,value,created_at")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (answersError) {
    return NextResponse.json({ error: "Não foi possível carregar respostas." }, { status: 500 });
  }

  const { data: referrals } = await supabase
    .from("referrals")
    .select("submission_id,section_key,referral_notes")
    .eq("wants_referral", true)
    .order("created_at", { ascending: false })
    .limit(1000);

  const answerCountBySubmission = new Map<string, number>();

  for (const answer of answers ?? []) {
    answerCountBySubmission.set(
      answer.submission_id,
      (answerCountBySubmission.get(answer.submission_id) ?? 0) + 1,
    );
  }

  const submissionsWithCounts = (submissions ?? []).map((submission) => ({
    ...submission,
    answers_count: answerCountBySubmission.get(submission.id) ?? 0,
  }));

  return NextResponse.json({
    totalSubmissions: submissionsWithCounts.length,
    submissions: submissionsWithCounts,
    referrals: referrals ?? [],
    csv: buildCsv(answers ?? []),
  });
}
