import { useCallback, useContext } from "react";
import { GlobalContext } from "../types/globalContext";

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
  } = context;

  /**
   * Starts the zkLogin process by generating the necessary initial values.
   * The rest of the flow is handled by useEffects in GlobalProvider.
   */
  const startLogin = useCallback(async () => {
    // Generate essential values for zkLogin
    generateEphemeralKeyPair();
    fetchCurrentEpoch();
    generateRandomnessValue();
    generateUserSalt();
  }, [
    generateEphemeralKeyPair,
    fetchCurrentEpoch,
    generateRandomnessValue,
    generateUserSalt,
  ]);

  return {
    startLogin,
  };
}
