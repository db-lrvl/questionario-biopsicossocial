import { NextResponse } from "next/server";
import { questionnaire, questionByKey } from "@/lib/form-schema/questionnaire";
import { isQuestionVisible } from "@/lib/form-schema/conditions";
import { createServiceClient } from "@/lib/supabase/server";
import { hashSecret, isValidFormToken } from "@/lib/security/access";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { submissionRequestSchema, validateAnswers } from "@/lib/validation/submission";

export const dynamic = "force-dynamic";

async function ensureQuestionnaireCatalog() {
  const supabase = createServiceClient();

  await supabase.from("questionnaires").upsert({
    id: questionnaire.id,
    title: questionnaire.title,
    version: questionnaire.version,
    source_file: questionnaire.sourceFile,
  });

  const sections = questionnaire.sections.map((section, index) => ({
    id: section.key,
    questionnaire_id: questionnaire.id,
    key: section.key,
    title: section.title,
    order_index: index,
  }));

  if (sections.length > 0) {
    await supabase.from("questionnaire_sections").upsert(sections);
  }

  const questions = questionnaire.sections.flatMap((section) =>
    section.questions.map((question, index) => ({
      id: question.key,
      questionnaire_id: questionnaire.id,
      section_id: section.key,
      key: question.key,
      number: question.number ?? null,
      label: question.label,
      type: question.type,
      options: question.options ?? null,
      condition: question.condition ?? null,
      order_index: index,
      is_sensitive: question.sensitive ?? false,
      is_institutional: question.institutional ?? false,
    })),
  );

  if (questions.length > 0) {
    await supabase.from("questions").upsert(questions);
  }

  return supabase;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`submission:${ip}`);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 });
  }

  const parsed = submissionRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  if (parsed.data.honeypot) {
    return NextResponse.json({ submissionId: "spam-ignored" }, { status: 200 });
  }

  if (!isValidFormToken(parsed.data.accessToken)) {
    return NextResponse.json({ error: "Código de acesso inválido." }, { status: 401 });
  }

  const { cleanAnswers, errors } = validateAnswers(parsed.data.answers);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  const supabase = await ensureQuestionnaireCatalog();
  const userAgent = request.headers.get("user-agent");

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .insert({
      questionnaire_id: questionnaire.id,
      status: "submitted",
      access_token_hash: hashSecret(parsed.data.accessToken),
      submitted_at: new Date().toISOString(),
      metadata: {
        ip_hash: hashSecret(ip),
        user_agent: userAgent,
      },
    })
    .select("id")
    .single();

  if (submissionError || !submission) {
    return NextResponse.json({ error: "Não foi possível registrar a submissão." }, { status: 500 });
  }

  const answers = Object.entries(cleanAnswers)
    .filter(([key]) => {
      const question = questionByKey.get(key);
      return question ? isQuestionVisible(question, cleanAnswers) : false;
    })
    .map(([key, value]) => {
      const question = questionByKey.get(key);

      return {
        submission_id: submission.id,
        question_id: key,
        question_key: key,
        section_key: question?.sectionKey ?? "desconhecida",
        value,
      };
    });

  if (answers.length > 0) {
    const { error } = await supabase.from("answers").insert(answers);

    if (error) {
      return NextResponse.json({ error: "Não foi possível registrar as respostas." }, { status: 500 });
    }
  }

  const referrals = Object.entries(cleanAnswers)
    .filter(([key, value]) => key.startsWith("encaminhamento_") && !key.endsWith("_notas") && value === "sim")
    .map(([key]) => {
      const question = questionByKey.get(key);
      const notes = cleanAnswers[`${key}_notas`];

      return {
        submission_id: submission.id,
        section_key: question?.sectionKey ?? "desconhecida",
        wants_referral: true,
        referral_notes: typeof notes === "string" ? notes : null,
      };
    });

  if (referrals.length > 0) {
    await supabase.from("referrals").insert(referrals);
  }

  const classifications = Object.entries(cleanAnswers)
    .filter(([key]) => questionByKey.get(key)?.institutional)
    .map(([key, value]) => {
      const question = questionByKey.get(key);

      return {
        submission_id: submission.id,
        section_key: question?.sectionKey ?? "desconhecida",
        question_key: key,
        value,
      };
    });

  if (classifications.length > 0) {
    await supabase.from("institutional_classifications").insert(classifications);
  }

  return NextResponse.json({ submissionId: submission.id }, { status: 201 });
}
