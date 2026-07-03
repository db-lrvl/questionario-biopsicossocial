export type QuestionType =
  | "text"
  | "textarea"
  | "number"
  | "radio"
  | "checkbox"
  | "select"
  | "boolean";

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "includes"
  | "not_empty";

export type QuestionCondition = {
  questionKey: string;
  operator: ConditionOperator;
  value?: string | string[] | boolean | number;
};

export type QuestionOption = {
  label: string;
  value: string;
  allowsText?: boolean;
};

export type Question = {
  key: string;
  number?: string;
  label: string;
  type: QuestionType;
  sectionKey: string;
  required?: boolean;
  sensitive?: boolean;
  institutional?: boolean;
  options?: QuestionOption[];
  condition?: QuestionCondition;
  helperText?: string;
};

export type QuestionnaireSection = {
  key: string;
  title: string;
  questions: Question[];
};

export type QuestionnaireSchema = {
  id: string;
  title: string;
  version: string;
  sourceFile: string;
  sections: QuestionnaireSection[];
};

export type AnswerValue = string | number | boolean | string[] | null;

export type AnswerMap = Record<string, AnswerValue>;
