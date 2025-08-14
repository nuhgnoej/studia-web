export default function getFinalPrompt(userInput: string) {
  const instruction = `
        당신은 주어진 학습 내용을 분석하여, 정의된 JSON 스키마에 따라
        객관식 또는 단답식 문제가 포함된 퀴즈를 생성하는 전문 AI입니다.

        **매우 중요한 규칙:**
        - 객관식 문제의 type 필드는 "objective" 값을 사용해야 합니다.
        - 주관식 문제의 type 필드는 "subjective" 값을 사용해야 합니다.
        - 문제와 답, 보기는 생성언어는 한국어입니다.

        아래 내용을 분석하여 규칙에 맞는 퀴즈 JSON을 생성해주세요.
        ---
        학습 내용: ${userInput}
        ---
      `;

  return instruction;
}
