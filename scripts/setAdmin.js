// admin 라이브러리를 가져옵니다.
const admin = require("firebase-admin");

// 1단계에서 준비한 서비스 계정 키 파일입니다.
const serviceAccount = require("../serviceAccountKey.json");

// Admin SDK를 초기화합니다.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 클레임을 설정할 사용자의 UID를 여기에 넣으세요.
const uid = "o0mPFgbNLsVlkHgpaA45NXccPyq2";

// 설정하고 싶은 클레임 내용입니다.
const customClaims = {
  isAdmin: true,
};

// 사용자에게 커스텀 클레임을 설정하는 함수를 실행합니다.
admin
  .auth()
  .setCustomUserClaims(uid, customClaims)
  .then(() => {
    console.log(
      `✅ 성공! 사용자(UID: ${uid})에게 클레임이 성공적으로 설정되었습니다.`
    );
    console.log("설정된 클레임:", customClaims);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 실패! 클레임 설정 중 오류가 발생했습니다:", error);
    process.exit(1);
  });
