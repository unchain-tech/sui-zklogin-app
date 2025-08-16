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
    generateUserSalt,
    generateZkLoginAddress,
    nonce,
  } = context;

  /**
   * ZKLoginするためのメソッド
   *
   *
   *
   */
  const login = useCallback(async () => {
    // 一時的な鍵ペアを生成
    const ephemeralKeyPair = generateEphemeralKeyPair();
    console.log("EphemeralKeyPair:", ephemeralKeyPair);
    // 現在のエポックを取得
    const currentEpoch = await fetchCurrentEpoch();
    console.log("CurrentEpoch:", currentEpoch);
    // ランダムネスを生成
    const randomness = generateRandomnessValue();
    console.log("Randomness:", randomness);
    // URLのパラメータを設定
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "id_token",
      scope: "openid",
      nonce: nonce,
    });
    // ログインURL
    const loginURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    window.location.replace(loginURL);

    // ユーザーソルトを作成する
    const userSalt = generateUserSalt();
    console.log("UserSalt:", userSalt);

    // ZKLoginアドレスを生成する
    generateZkLoginAddress();
  }, [
    generateEphemeralKeyPair,
    fetchCurrentEpoch,
    generateRandomnessValue,
    generateUserSalt,
    generateZkLoginAddress,
    nonce,
  ]);

  return {
    login,
  };
}
