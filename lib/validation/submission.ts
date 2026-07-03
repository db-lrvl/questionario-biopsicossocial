import { z } from "zod";
import { allQuestions, questionByKey } from "@/lib/form-schema/questionnaire";
import { isQuestionVisible } from "@/lib/form-schema/conditions";
import type { AnswerMap, AnswerValue } from "@/lib/form-schema/types";

const answerValueSchema = z.union([
  z.string().max(5000),
  z.number(),
  z.boolean(),
  z.array(z.string().max(500)).max(50),
  z.null(),
]);

export const submissionRequestSchema = z.object({
  accessToken: z.string().min(1).max(200),
  honeypot: z.string().max(200).optional().default(""),
  answers: z.record(z.string(), answerValueSchema),
});

export type SubmissionRequest = z.infer<typeof submissionRequestSchema>;

export function validateAnswers(answers: Record<string, AnswerValue>) {
  const cleanAnswers: AnswerMap = {};
  const errors: string[] = [];

  for (const [key, value] of Object.entries(answers)) {
    const question = questionByKey.get(key);

    if (!question) {
      errors.push(`Pergunta desconhecida: ${key}`);
      continue;
    }

    if (!isQuestionVisible(question, answers)) {
      continue;
    }

    if (question.type === "checkbox" && value !== null && !Array.isArray(value)) {
      errors.push(`Resposta inválida para ${question.label}`);
      continue;
    }

    if (question.type === "number" && value !== null && value !== "" && Number.isNaN(Number(value))) {
      errors.push(`Resposta numérica inválida para ${question.label}`);
      continue;
    }

    cleanAnswers[key] = value;
  }

  for (const question of allQuestions) {
    if (!question.required || !isQuestionVisible(question, cleanAnswers)) {
      continue;
    }

    const value = cleanAnswers[question.key];
    const isEmptyArray = Array.isArray(value) && value.length === 0;

    if (value === undefined || value === null || value === "" || isEmptyArray) {
      errors.push(`Campo obrigatório ausente: ${question.label}`);
    }
  }

  return { cleanAnswers, errors };
}
