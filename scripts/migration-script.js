const fs = require("fs").promises;
const path = require("path");

// 👇 1. 여기에 변환할 파일이 있는 폴더 경로를 직접 입력하세요.
const TARGET_DIRECTORY = ".";

/**
 * 주어진 디렉터리의 모든 JSON 파일에 대해 마이그레이션을 수행하는 함수
 * @param {string} directoryPath - 마이그레이션할 JSON 파일들이 있는 폴더 경로
 */
async function migrateDirectory(directoryPath) {
  // ... (이 부분의 로직은 이전과 동일합니다) ...
  try {
    console.log(`🔍 ${directoryPath} 에서 마이그레이션을 시작합니다...`);
    const files = await fs.readdir(directoryPath);

    for (const file of files) {
      if (path.extname(file).toLowerCase() !== ".json") {
        continue;
      }
      const filePath = path.join(directoryPath, file);
      try {
        const content = await fs.readFile(filePath, "utf8");
        const quizData = JSON.parse(content);
        let wasModified = false;

        if (quizData.questions && Array.isArray(quizData.questions)) {
          for (const question of quizData.questions) {
            if (
              question.choices &&
              Array.isArray(question.choices) &&
              typeof question.choices[0] === "string"
            ) {
              question.choices = question.choices.map((choiceString) => ({
                choice: choiceString,
                choiceExplanation: "",
              }));
              wasModified = true;
            }
          }
        }

        if (wasModified) {
          const newContent = JSON.stringify(quizData, null, 2);
          await fs.writeFile(filePath, newContent, "utf8");
          console.log(`✅ [변환 완료] ${file}`);
        } else {
          console.log(
            `⚪ [건너뛰기] ${file} (이미 새로운 형식이거나 choices가 없음)`
          );
        }
      } catch (error) {
        console.error(
          `❌ [오류 발생] ${file} 처리 중 문제 발생:`,
          error.message
        );
      }
    }
    console.log("\n✨ 모든 작업이 완료되었습니다.");
  } catch (error) {
    console.error(
      `❗ 디렉터리를 읽는 중 심각한 오류가 발생했습니다:`,
      error.message
    );
  }
}

// --- 스크립트 실행 부분 (수정) ---
// 👇 2. 위에서 정의한 TARGET_DIRECTORY를 사용하도록 변경합니다.
if (!TARGET_DIRECTORY) {
  console.error(
    "오류: 스크립트 상단의 TARGET_DIRECTORY 변수에 폴더 경로를 입력해주세요."
  );
} else {
  migrateDirectory(TARGET_DIRECTORY);
}
