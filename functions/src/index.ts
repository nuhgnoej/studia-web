import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { CallableRequest } from "firebase-functions/v2/https";

// Admin SDK를 초기화합니다.
admin.initializeApp();

/**
 * Firebase Authentication 커스텀 클레임을 설정하는 HTTP Callable 함수 (v2)
 * 관리자 권한을 부여할 때 사용합니다.
 * @param request - { data: { email?: string, uid?: string } }
 * @returns { success: boolean, message: string }
 */
export const setAdminClaim = onCall(
  async (request: CallableRequest<{ email?: string; uid?: string }>) => {
    // 1. 요청을 보낸 사용자가 관리자인지 확인합니다.
    // v2에서는 request.auth 객체를 사용합니다.
    if (request.auth?.token.isAdmin !== true) {
      throw new HttpsError(
        "permission-denied",
        "관리자만 이 작업을 수행할 수 있습니다."
      );
    }

    // 2. 관리자 권한을 부여할 대상 사용자의 UID를 가져옵니다.
    // v2에서는 request.data 객체로 데이터에 접근합니다.
    const { email, uid } = request.data;
    if (!email && !uid) {
      throw new HttpsError(
        "invalid-argument",
        "사용자의 UID 또는 이메일을 제공해야 합니다."
      );
    }

    let targetUid: string;
    if (email) {
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        targetUid = userRecord.uid;
      } catch (error) {
        throw new HttpsError(
          "not-found",
          `이메일 ${email}에 해당하는 사용자를 찾을 수 없습니다.`
        );
      }
    } else {
      // uid가 null이나 undefined가 아님을 TypeScript에 알려줍니다.
      targetUid = uid!;
    }

    // 3. 사용자에게 'isAdmin: true' 커스텀 클레임을 설정합니다.
    try {
      await admin.auth().setCustomUserClaims(targetUid, { isAdmin: true });
      return {
        success: true,
        message: `사용자 ${targetUid}에게 관리자 권한을 부여했습니다.`,
      };
    } catch (error) {
      console.error("클레임 설정 중 오류 발생:", error);
      throw new HttpsError("internal", "클레임 설정 중 오류가 발생했습니다.");
    }
  }
);
