import type { AnswerMap, Question, QuestionCondition } from "./types";

function asArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

export function evaluateCondition(condition: QuestionCondition | undefined, answers: AnswerMap) {
  if (!condition) {
    return true;
  }

  const currentValue = answers[condition.questionKey];

  if (condition.operator === "not_empty") {
    return currentValue !== undefined && currentValue !== null && String(currentValue) !== "";
  }

  if (condition.operator === "equals") {
    return String(currentValue) === String(condition.value);
  }

  if (condition.operator === "not_equals") {
    return String(currentValue) !== String(condition.value);
  }

  if (condition.operator === "includes") {
    if (currentValue === undefined || currentValue === null) {
      return false;
    }

    const expectedValues = asArray(condition.value);
    const currentValues = asArray(currentValue);
    return currentValues.some((value) => expectedValues.includes(value));
  }

  return false;
}

export function isQuestionVisible(question: Question, answers: AnswerMap) {
  return evaluateCondition(question.condition, answers);
}
