import { Schema } from "firebase/ai";

// types/question.ts의 인터페이스를 바탕으로 응답 스키마를 정의합니다.
const MetadataSchema = Schema.object({
  properties: {
    id: Schema.string({ description: "퀴즈 데이터의 고유 ID" }),
    title: Schema.string({ description: "퀴즈의 제목" }),
    description: Schema.string({ description: "퀴즈에 대한 설명" }),
    subject: Schema.string({ description: "퀴즈의 주제 (예: 컴퓨터 과학)" }),
    category: Schema.array({
      items: Schema.string(),
      description: "관련 카테고리 배열",
    }),
    difficulty: Schema.string({
      description: "퀴즈의 난이도 (예: 초급, 중급, 고급)",
    }),
    version: Schema.string({ description: "퀴즈 데이터의 버전" }),
    created_at: Schema.string({ description: "생성 날짜 (ISO 8601 형식)" }),
    updated_at: Schema.string({
      description: "마지막 수정 날짜 (ISO 8601 형식)",
    }),
    author: Schema.string({ description: "작성자 이름" }),
    source: Schema.string({ description: "내용의 출처" }),
    tags: Schema.array({
      items: Schema.string(),
      description: "관련 태그 배열",
    }),
    license: Schema.string({ description: "콘텐츠 라이선스" }),
    num_questions: Schema.number({ description: "총 질문의 수" }),
  },
});

const QuestionContentSchema = Schema.object({
  properties: {
    questionText: Schema.string({ description: "질문 내용" }),
    questionExplanation: Schema.array({
      items: Schema.string(),
      description: "질문에 대한 추가 설명 배열",
    }),
  },
});

const AnswerContentSchema = Schema.object({
  properties: {
    answerText: Schema.string({ description: "정답 내용" }),
    answerExplanation: Schema.string({ description: "정답에 대한 해설" }),
  },
});

const ChoiceSchema = Schema.object({
  properties: {
    choice: Schema.string({ description: "선택지 내용" }),
    choiceExplanation: Schema.string({
      description: "해당 선택지에 대한 설명 (정답 또는 오답 이유)",
    }),
  },
});

const QuestionSchema = Schema.object({
  properties: {
    id: Schema.number({ description: "질문의 순서 번호 (1부터 시작)" }),
    type: Schema.string({
      description: "질문 유형",
      enum: ["objective", "subjective"],
    }),
    question: QuestionContentSchema,
    choices: Schema.array({
      items: ChoiceSchema,
      description: "객관식 선택지 배열. 각 선택지는 내용과 설명을 포함합니다.",
    }),
    answer: AnswerContentSchema,
    tags: Schema.array({
      items: Schema.string(),
      description: "질문 관련 태그 배열",
    }),
  },
  optionalProperties: ["choices"],
});

// 다른 파일에서 가져다 쓸 수 있도록 export 합니다.
export const QuizDataSchema = Schema.object({
  properties: {
    metadata: MetadataSchema,
    questions: Schema.array({ items: QuestionSchema }),
  },
});
