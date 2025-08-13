import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

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
