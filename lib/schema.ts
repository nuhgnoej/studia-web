import { Schema } from "firebase/ai";

const MetadataSchema = Schema.object({
  properties: {
    id: Schema.string(),
    title: Schema.string(),
    description: Schema.string(),
    subject: Schema.string(),
    category: Schema.array({ items: Schema.string() }),
    difficulty: Schema.string(),
    version: Schema.string(),
    created_at: Schema.string(),
    updated_at: Schema.string(),
    author: Schema.string(),
    source: Schema.string(),
    tags: Schema.array({ items: Schema.string() }),
    license: Schema.string(),
    num_questions: Schema.number(),
  },
});

const QuestionContentSchema = Schema.object({
  properties: {
    questionText: Schema.string(),
    questionExplanation: Schema.array({ items: Schema.string() }),
  },
});

const AnswerContentSchema = Schema.object({
  properties: {
    answerText: Schema.string(),
    answerExplanation: Schema.string(),
  },
});

const ChoiceSchema = Schema.object({
  properties: {
    choice: Schema.string(),
    choiceExplanation: Schema.string(),
  },
});

const QuestionSchema = Schema.object({
  properties: {
    id: Schema.number(),
    type: Schema.string({ enum: ["objective", "subjective"] }),
    question: QuestionContentSchema,
    choices: Schema.array({ items: ChoiceSchema }),
    answer: AnswerContentSchema,
    tags: Schema.array({ items: Schema.string() }),
  },
  optionalProperties: ["choices"],
});

export const QuizDataSchema = Schema.object({
  properties: {
    metadata: MetadataSchema,
    questions: Schema.array({ items: QuestionSchema }),
  },
});
