import { useCallback, useContext } from "react";
import { GlobalContext } from "../types/globalContext";
import { CLIENT_ID, REDIRECT_URI } from "../utils/constant";

/**
 * zkLogin関連の状態とメソッドを使用するためのカスタムフック
 */
export function useZKLogin() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useZKLogin must be used within a GlobalProvider");
  }

  const {
    generateEphemeralKeyPair,
    generateRandomnessValue,
    fetchCurrentEpoch,
    generateNonceValue,
    generateUserSalt,
    generateZkLoginAddress,
    nonce,
  } = context;

  /**
   * ZKLoginするためのメソッド
   * 1. 一時的な鍵ペアを生成
   * 2. 現在のエポックを取得
   * 3. ランダムネス&ナンスを生成
   * 4. URLのパラメータを設定
   * 5. ユーザーソルトを生成
   * 6. ZKLoginアドレスを生成する
   */
  const login = useCallback(async () => {
    // すべての非同期処理を順番に完了させる
    await generateEphemeralKeyPair();
    await fetchCurrentEpoch();
    await generateNonceValue();
    await generateRandomnessValue();

    // 必要ならここでuserSaltやZKLoginアドレス生成
    await generateUserSalt();
    await generateZkLoginAddress();

    // すべて完了後にリダイレクト
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "id_token",
      scope: "openid",
      nonce: nonce,
    });
    const loginURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    console.log("loginURL", loginURL);
    window.location.replace(loginURL);
  }, [
    generateEphemeralKeyPair,
    fetchCurrentEpoch,
    generateRandomnessValue,
    generateNonceValue,
    generateUserSalt,
    generateZkLoginAddress,
    nonce,
  ]);

  return {
    login,
  };
}
