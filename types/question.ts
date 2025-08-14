// 메타데이터 타입을 정의합니다.
export interface Metadata {
  id: string;
  title: string;
  description: string;
  subject: string;
  category: string[];
  difficulty: string;
  version: string;
  created_at: string;
  updated_at: string;
  author: string;
  source: string;
  tags: string[];
  license: string;
  num_questions: number;
}

// 질문 객체 내부 타입을 먼저 정의합니다.
export interface QuestionContent {
  questionText: string;
  questionExplanation: string[];
}

export interface AnswerContent {
  answerText: string;
  answerExplanation: string;
}

export interface Choice {
  choice: string;
  choiceExplanation: string;
}

// 최종 질문 타입을 정의합니다.
export interface Question {
  id: number;
  type: string;
  question: QuestionContent;
  choices: Choice[];
  answer: AnswerContent;
  tags: string[];
}

// 전체 데이터 타입을 정의합니다.
export interface QuizData {
  metadata: Metadata;
  questions: Question[];
}
