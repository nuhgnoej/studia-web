import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import cors from "cors";

setGlobalOptions({ region: "asia-northeast3" });

// CORS 미들웨어를 초기화합니다.
const corsHandler = cors({ origin: true });

// Admin SDK 및 Firestore 초기화
admin.initializeApp();
const db = admin.firestore();

/**
 * 사용자가 관리자인지 확인하는 헬퍼 함수
 * @param auth - Callable 함수의 request.auth 객체
 */
const ensureIsAdmin = (auth: admin.auth.DecodedIdToken | undefined) => {
  if (auth?.isAdmin !== true) {
    throw new HttpsError(
      "permission-denied",
      "이 작업을 수행하려면 관리자 권한이 필요합니다."
    );
  }
};

/**
 * 관리자 권한을 부여하는 함수
 * @param data - { email: string }
 */
export const setAdminClaim = onCall(async (request) => {
  ensureIsAdmin(request.auth?.token);

  const { email } = request.data;
  if (typeof email !== "string") {
    throw new HttpsError(
      "invalid-argument",
      "유효한 이메일을 제공해야 합니다."
    );
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    // 1. 인증 토큰에 커스텀 클레임 설정
    await admin.auth().setCustomUserClaims(user.uid, { isAdmin: true });
    // 2. Firestore 문서에도 상태 업데이트
    await db
      .collection("users")
      .doc(user.uid)
      .set({ isAdmin: true }, { merge: true });

    return { message: `성공: ${email} 사용자에게 관리자 권한을 부여했습니다.` };
  } catch (error) {
    console.error("관리자 권한 부여 오류:", error);
    throw new HttpsError(
      "not-found",
      "사용자를 찾을 수 없거나 오류가 발생했습니다."
    );
  }
});

/**
 * 관리자 권한을 회수하는 함수
 * @param data - { uid: string }
 */
export const revokeAdminClaim = onCall(async (request) => {
  ensureIsAdmin(request.auth?.token);

  const { uid } = request.data;
  if (typeof uid !== "string") {
    throw new HttpsError("invalid-argument", "유효한 UID를 제공해야 합니다.");
  }

  try {
    // 1. 인증 토큰에서 커스텀 클레임 제거
    await admin.auth().setCustomUserClaims(uid, { isAdmin: false });
    // 2. Firestore 문서에서도 상태 업데이트
    await db
      .collection("users")
      .doc(uid)
      .set({ isAdmin: false }, { merge: true });

    return {
      message: `성공: 사용자(UID: ${uid})의 관리자 권한을 회수했습니다.`,
    };
  } catch (error) {
    console.error("관리자 권한 회수 오류:", error);
    throw new HttpsError("internal", "권한 회수 중 오류가 발생했습니다.");
  }
});

/**
 * 관리자 목록과 각 관리자의 DB 상태를 함께 반환하는 함수
 */
export const listAdminUsers = onCall(async (request) => {
  ensureIsAdmin(request.auth?.token);

  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const adminRecords = listUsersResult.users.filter(
      (user) => user.customClaims?.isAdmin === true
    );

    if (adminRecords.length === 0) {
      return [];
    }

    // 각 관리자의 Firestore 문서를 동시에 조회하기 위한 준비
    const firestorePromises = adminRecords.map((user) =>
      db.collection("users").doc(user.uid).get()
    );

    const firestoreSnapshots = await Promise.all(firestorePromises);

    // 인증 정보와 Firestore 정보를 합쳐서 최종 데이터 생성
    const adminUsers = adminRecords.map((user, index) => {
      const firestoreDoc = firestoreSnapshots[index];
      return {
        uid: user.uid,
        email: user.email,
        tokenIsAdmin: true, // 이 목록은 이미 토큰 기준이므로 항상 true
        firestoreIsAdmin:
          firestoreDoc.exists && firestoreDoc.data()?.isAdmin === true,
      };
    });

    return adminUsers;
  } catch (error) {
    console.error("관리자 목록 조회 오류:", error);
    throw new HttpsError(
      "internal",
      "관리자 목록을 불러오는 중 오류가 발생했습니다."
    );
  }
});

// 변경점 3: v2 스타일의 onRequest로 storageProxy 함수를 다시 작성합니다.
export const storageProxy = onRequest((req, res) => {
  // 1. CORS 정책을 적용합니다.
  corsHandler(req, res, async () => {
    // 2. 쿼리 파라미터에서 다운로드할 파일 경로를 가져옵니다.
    const filePath = req.query.filePath;

    // 3. 파일 경로가 유효한지 확인합니다.
    if (!filePath || typeof filePath !== "string") {
      res
        .status(400)
        .send("잘못된 요청입니다. 파일 경로(filePath)를 확인하세요.");
      return;
    }

    try {
      const bucket = admin.storage().bucket();
      const file = bucket.file(filePath);

      const [exists] = await file.exists();
      if (!exists) {
        res.status(404).send("파일을 찾을 수 없습니다.");
        return;
      }

      // 4. 브라우저가 파일을 다운로드하도록 응답 헤더를 설정합니다.
      const fileName = filePath.split("/").pop() || "download.json";
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileName)}"`
      );
      res.setHeader("Content-Type", "application/json");

      // 5. 파일 스트림을 생성하여 클라이언트로 직접 전송합니다.
      const readStream = file.createReadStream();
      readStream.pipe(res);
    } catch (error) {
      // v2에서는 functions.logger 대신 console.error를 사용해도 됩니다.
      console.error("프록시 처리 중 오류 발생:", error);
      res.status(500).send("서버 내부 오류가 발생했습니다.");
    }
  });
});

/**
 * HTTP 요청을 받아 Storage의 파일을 삭제하는 프록시 함수
 */
export const deleteStorageObject = onRequest(async (req, res) => {
  // 1. CORS 정책을 적용합니다.
  corsHandler(req, res, async () => {
    // 🚨 중요: 실제 프로덕션에서는 이 함수를 호출하는 사용자가
    // 관리자인지 확인하는 로직이 반드시 필요합니다.
    // 예시:
    // const idToken = req.headers.authorization?.split('Bearer ')[1];
    // if (!idToken) {
    //   res.status(401).send("인증 토큰이 없습니다.");
    //   return;
    // }
    // try {
    //   const decodedToken = await admin.auth().verifyIdToken(idToken);
    //   if (decodedToken.isAdmin !== true) {
    //     res.status(403).send("관리자 권한이 필요합니다.");
    //     return;
    //   }
    // } catch (error) {
    //   res.status(401).send("유효하지 않은 토큰입니다.");
    //   return;
    // }

    // 2. 쿼리 파라미터에서 삭제할 파일 경로를 가져옵니다.
    const filePath = req.query.filePath;
    if (!filePath || typeof filePath !== "string") {
      res.status(400).send("파일 경로(filePath)가 올바르지 않습니다.");
      return;
    }

    try {
      // 3. Admin SDK를 사용해 파일을 삭제합니다.
      const bucket = admin.storage().bucket();
      const file = bucket.file(filePath);

      const [exists] = await file.exists();
      if (!exists) {
        // 파일이 이미 없어도 성공으로 간주할 수 있습니다.
        res.status(200).send({ message: "파일이 이미 존재하지 않습니다." });
        return;
      }

      await file.delete();
      res.status(200).send({ message: "파일이 성공적으로 삭제되었습니다." });
    } catch (error) {
      console.error("Storage 파일 삭제 중 오류 발생:", error);
      res.status(500).send("파일 삭제 중 서버 오류가 발생했습니다.");
    }
  });
});

/**
 * 클라이언트가 파일을 Storage에 직접 업로드할 수 있는
 * 서명된 URL(Signed URL)을 생성하여 반환하는 함수
 */
export const getSignedUploadUrl = onCall(async (request) => {
  // 1. 관리자만 이 함수를 호출할 수 있도록 권한을 확인합니다.
  ensureIsAdmin(request.auth?.token);

  // 2. 클라이언트로부터 파일 이름과 타입을 전달받습니다.
  const { fileName, contentType } = request.data;
  if (
    !fileName ||
    typeof fileName !== "string" ||
    !contentType ||
    typeof contentType !== "string"
  ) {
    throw new HttpsError("invalid-argument", "파일 이름과 타입이 필요합니다.");
  }

  try {
    const bucket = admin.storage().bucket();
    const filePath = `archives/${fileName}`; // 파일이 저장될 경로
    const file = bucket.file(filePath);

    // 3. 15분 동안 유효한, 파일을 업로드(write)할 수 있는 URL을 생성합니다.
    const [url] = await file.getSignedUrl({
      action: "write",
      version: "v4", // v4 서명 방식 사용
      expires: Date.now() + 15 * 60 * 1000, // 15분 후 만료
      contentType: contentType, // 클라이언트가 보내는 파일 타입과 일치해야 함
    });

    // 4. 생성된 URL과 파일 경로를 클라이언트에 반환합니다.
    return { uploadUrl: url, storagePath: filePath };
  } catch (error) {
    console.error("서명된 업로드 URL 생성 오류:", error);
    throw new HttpsError("internal", "업로드 링크를 생성하는 데 실패했습니다.");
  }
});
