import { fromB64 } from "@mysten/bcs";
import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import {
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  jwtToAddress,
} from "@mysten/zklogin";
import axios from "axios";
import type { JwtPayload } from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import { enqueueSnackbar } from "notistack";
import queryString from "query-string";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type {
  GlobalContextType,
  PartialZkLoginSignature,
} from "../types/globalContext";
import {
  CLIENT_ID,
  FULLNODE_URL,
  REDIRECT_URI,
  SUI_PROVER_DEV_ENDPOINT,
} from "../utils/constant";

// SuiClient instance
const suiClient = new SuiClient({ url: FULLNODE_URL });

import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { GlobalContext } from "../types/globalContext";
import {
  KEY_PAIR_SESSION_STORAGE_KEY,
  RANDOMNESS_SESSION_STORAGE_KEY,
} from "../utils/constant";
import { decrypt, encrypt } from "../utils/crypto";

// Provider Props の型定義
interface GlobalProviderProps {
  children: ReactNode;
}

/**
 * Global Provider Component
 * zkLogin関連の共通状態とロジックを管理
 */
export function GlobalProvider({ children }: GlobalProviderProps) {
  // State
  const [currentEpoch, setCurrentEpoch] = useState("");
  const [nonce, setNonce] = useState("");
  const [oauthParams, setOauthParams] =
    useState<queryString.ParsedQuery<string>>();
  const [zkLoginUserAddress, setZkLoginUserAddress] = useState("");
  const [decodedJwt, setDecodedJwt] = useState<JwtPayload>();
  const [jwtString, setJwtString] = useState("");
  const [ephemeralKeyPair, setEphemeralKeyPair] = useState<Ed25519Keypair>();
  const [userSalt, setUserSalt] = useState<string>();
  const [zkProof, setZkProof] = useState<PartialZkLoginSignature>();
  const [extendedEphemeralPublicKey, setExtendedEphemeralPublicKey] =
    useState("");
  const [maxEpoch, setMaxEpoch] = useState(0);
  const [randomness, setRandomness] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // 認証状態のローディング
  const [fetchingZKProof, setFetchingZKProof] = useState(false);
  const [executingTxn, setExecutingTxn] = useState(false);
  const [executeDigest, setExecuteDigest] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // nonce生成: 鍵ペア・maxEpoch・randomnessが揃ったら自動生成
  useEffect(() => {
    const hasIdToken = window.location.hash.includes("id_token=");
    if (!hasIdToken && ephemeralKeyPair && maxEpoch && randomness) {
      // ナンスを生成する
      const newNonce = generateNonce(
        ephemeralKeyPair.getPublicKey(),
        maxEpoch,
        randomness,
      );
      setNonce(newNonce);
    }
  }, [ephemeralKeyPair, maxEpoch, randomness]);

  // Google OAuthリダイレクト: nonceが生成されたら自動実行
  useEffect(() => {
    const hasIdToken = window.location.hash.includes("id_token=");
    if (!hasIdToken && nonce && window.location.pathname === "/") {
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "id_token",
        scope: "openid",
        nonce: nonce,
      });
      const loginURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      window.location.replace(loginURL);
    }
  }, [nonce]);

  // ZKLoginアドレス生成: jwtStringとuserSaltが揃ったら自動生成
  useEffect(() => {
    if (jwtString && userSalt) {
      // ZKLogin 用のウォレットアドレスを生成
      const zkLoginAddress = jwtToAddress(jwtString, userSalt);
      setZkLoginUserAddress(zkLoginAddress);
    }
  }, [jwtString, userSalt]);

  /**
   * ephemeralKeyPairがセットされたら拡張公開鍵を自動生成するコールバック関数
   */
  const generateExtendedEphemeralPublicKeyCallback = useCallback(() => {
    if (!ephemeralKeyPair) return;
    // 拡張公開鍵を生成
    const extendedKey = getExtendedEphemeralPublicKey(
      ephemeralKeyPair.getPublicKey(),
    );
    setExtendedEphemeralPublicKey(extendedKey);
  }, [ephemeralKeyPair]);

  useEffect(() => {
    if (ephemeralKeyPair) {
      generateExtendedEphemeralPublicKeyCallback();
    }
  }, [ephemeralKeyPair, generateExtendedEphemeralPublicKeyCallback]);

  // ephemeralKeyPairがセットされたら拡張公開鍵を自動生成
  useEffect(() => {
    if (ephemeralKeyPair) {
      generateExtendedEphemeralPublicKeyCallback();
    }
  }, [ephemeralKeyPair, generateExtendedEphemeralPublicKeyCallback]);

  /**
   * ZKProof自動取得するコールバック関数
   * 必要な情報が揃ったらfetchZkProofを呼び出す
   */
  const fetchZkProofCallback = useCallback(async () => {
    if (
      jwtString &&
      userSalt &&
      maxEpoch &&
      ephemeralKeyPair &&
      extendedEphemeralPublicKey &&
      randomness
    ) {
      setFetchingZKProof(true);
      try {
        // ZK用のAPIにリクエストを送信してZKProofを生成する
        const zkProofResult = await axios.post(
          SUI_PROVER_DEV_ENDPOINT,
          {
            // JWT、拡張公開鍵、エポック数、ランダムネス、ユーザーソルトを詰めてAPIを呼び出す
            jwt: oauthParams?.id_token as string,
            extendedEphemeralPublicKey,
            maxEpoch,
            jwtRandomness: randomness,
            salt: userSalt,
            keyClaimName: "sub",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        setZkProof(zkProofResult.data as PartialZkLoginSignature);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingZKProof(false);
      }
    }
  }, [
    jwtString,
    userSalt,
    maxEpoch,
    ephemeralKeyPair,
    extendedEphemeralPublicKey,
    randomness,
    oauthParams,
  ]);

  useEffect(() => {
    if (
      jwtString &&
      userSalt &&
      maxEpoch &&
      ephemeralKeyPair &&
      extendedEphemeralPublicKey &&
      randomness &&
      !zkProof
    ) {
      fetchZkProofCallback();
    }
  }, [
    jwtString,
    userSalt,
    maxEpoch,
    ephemeralKeyPair,
    extendedEphemeralPublicKey,
    randomness,
    zkProof,
    fetchZkProofCallback,
  ]);

  useEffect(() => {
    setLoading(true);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // zkLoginデータをSupabaseから取得する関数
  const fetchZkLoginData = async (
    userId: string,
  ): Promise<{ encryptedUserSalt: string; maxEpoch: number } | null> => {
    try {
      const { data, error } = await supabase
        .from("zk_login_data")
        .select("encrypted_user_salt, max_epoch")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // データなし
          return null;
        }
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        encryptedUserSalt: data.encrypted_user_salt,
        maxEpoch: data.max_epoch,
      };
    } catch (error) {
      console.error("Failed to fetch zkLogin data:", error);
      throw error; // エラーを再スローして呼び出し元で処理
    }
  };

  // zkLoginデータをSupabaseに保存/更新する関数
  const saveZkLoginData = async (
    userId: string,
    encryptedSalt: string,
    maxEpoch: number,
  ) => {
    const { error } = await supabase.from("zk_login_data").upsert(
      {
        id: userId,
        encrypted_user_salt: encryptedSalt,
        max_epoch: maxEpoch,
      },
      {
        onConflict: "id",
        ignoreDuplicates: false,
      },
    );

    if (error) {
      console.error("Failed to save zkLogin data:", error);
      throw new Error(`Failed to save zkLogin data: ${error.message}`);
    }
  };

  // Location の監視（OAuth パラメータの取得）
  useEffect(() => {
    const res = queryString.parse(location.hash.replace(/^#/, ""));
    setOauthParams(res);
  }, [location]);

  // zkLoginデータの初期化（取得または新規作成）関数
  const initializeZkLoginData = useCallback(async (userId: string) => {
    // ここでuser_saltの復号に必要なPIN/パスワードの入力をユーザーに求める
    const userPin = prompt(
      "Please enter your PIN to decrypt your zkLogin data:",
    );
    if (!userPin) {
      enqueueSnackbar("PIN is required to access zkLogin data.", {
        variant: "error",
      });
      return;
    }

    try {
      const fetchedData = await fetchZkLoginData(userId);

      let currentSalt = "";
      if (fetchedData?.encryptedUserSalt) {
        // 復号処理
        currentSalt = await decrypt(fetchedData.encryptedUserSalt, userPin);
        setMaxEpoch(fetchedData.maxEpoch);
      } else {
        // 初回ログインまたはデータなしの場合
        currentSalt = generateRandomness();
        const { epoch } = await suiClient.getLatestSuiSystemState();
        const newMaxEpoch = Number(epoch) + 10;

        // 暗号化処理
        const encryptedNewSalt = await encrypt(currentSalt, userPin);
        await saveZkLoginData(userId, encryptedNewSalt, newMaxEpoch);
        setMaxEpoch(newMaxEpoch);
      }
      setUserSalt(currentSalt);
    } catch (error) {
      console.error("Failed to initialize zkLogin data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      enqueueSnackbar(`Failed to initialize zkLogin data: ${errorMessage}`, {
        variant: "error",
      });
    }
  }, []);

  // 既存ユーザーのデータ移行
  const migrateFromLocalStorage = useCallback(async (userId: string) => {
    const existingSalt = window.localStorage.getItem("demo_user_salt_key_pair");
    const existingMaxEpoch = window.localStorage.getItem(
      "demo_max_epoch_key_pair",
    );

    if (existingSalt && existingMaxEpoch) {
      // ユーザーにPIN/パスワードの入力を求め、既存のsaltを暗号化
      const userPin = prompt(
        "Existing zkLogin data found. Please enter a PIN to encrypt and migrate your data:",
      );
      if (!userPin) {
        enqueueSnackbar("PIN is required to migrate existing data.", {
          variant: "warning",
        });
        return;
      }

      try {
        const encryptedSalt = await encrypt(existingSalt, userPin);
        await saveZkLoginData(
          userId,
          encryptedSalt,
          parseInt(existingMaxEpoch, 10),
        );

        // 移行成功後、ローカルストレージをクリア
        window.localStorage.removeItem("demo_user_salt_key_pair");
        window.localStorage.removeItem("demo_max_epoch_key_pair");
        enqueueSnackbar("Existing zkLogin data migrated successfully!", {
          variant: "success",
        });
      } catch (error) {
        console.error("Failed to migrate existing data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        enqueueSnackbar(`Failed to migrate existing data: ${errorMessage}`, {
          variant: "error",
        });
      }
    }
  }, []);

  // JWT トークンの処理
  useEffect(() => {
    const handleLocalStorageFallback = async () => {
      // 従来のローカルストレージベースの処理
      let existingSalt = window.localStorage.getItem("demo_user_salt_key_pair");
      let existingMaxEpoch = window.localStorage.getItem(
        "demo_max_epoch_key_pair",
      );

      if (!existingSalt) {
        // 初回ログイン: 新しいsaltを生成
        existingSalt = generateRandomness();
        window.localStorage.setItem("demo_user_salt_key_pair", existingSalt);

        // 現在のエポックを取得してmaxEpochを設定
        const { epoch } = await suiClient.getLatestSuiSystemState();
        const newMaxEpoch = Number(epoch) + 10;
        existingMaxEpoch = newMaxEpoch.toString();
        window.localStorage.setItem(
          "demo_max_epoch_key_pair",
          existingMaxEpoch,
        );
        setMaxEpoch(newMaxEpoch);
      } else {
        setMaxEpoch(parseInt(existingMaxEpoch || "0", 10));
      }

      setUserSalt(existingSalt);
    };

    if (oauthParams?.id_token && !session) {
      // 現在はローカルストレージベースの処理のみを使用
      // Supabase認証は一旦無効化し、データ保存のみに使用
      handleLocalStorageFallback();

      // ... 既存のJWTデコード処理など
      const decodedJwt = jwtDecode(oauthParams.id_token as string);
      setJwtString(oauthParams.id_token as string);
      setDecodedJwt(decodedJwt);
      setActiveStep(2);
    }
  }, [oauthParams, session]);

  // ローカルストレージからの状態復元
  useEffect(() => {
    const privateKey = window.sessionStorage.getItem(
      KEY_PAIR_SESSION_STORAGE_KEY,
    );
    if (privateKey) {
      const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
        fromB64(privateKey),
      );
      setEphemeralKeyPair(ephemeralKeyPair);
    }

    const savedRandomness = window.sessionStorage.getItem(
      RANDOMNESS_SESSION_STORAGE_KEY,
    );
    if (savedRandomness) {
      setRandomness(savedRandomness);
    }
  }, []);

  // アプリケーションの初期ロード時、またはユーザー認証後に一度だけ呼び出す
  useEffect(() => {
    if (user) {
      migrateFromLocalStorage(user.id);
    }
  }, [user, migrateFromLocalStorage]);

  // Methods
  const resetState = () => {
    setCurrentEpoch("");
    setNonce("");
    setOauthParams(undefined);
    setZkLoginUserAddress("");
    setDecodedJwt(undefined);
    setJwtString("");
    setEphemeralKeyPair(undefined);
    setUserSalt(undefined);
    setZkProof(undefined);
    setExtendedEphemeralPublicKey("");
    setMaxEpoch(0);
    setRandomness("");
    setActiveStep(0);
    setFetchingZKProof(false);
    setExecutingTxn(false);
    setExecuteDigest("");
  };

  /**
   * signOutするための関数
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error", error);
      enqueueSnackbar(`Sign out failed: ${error.message}`, {
        variant: "error",
      });
    }
    // stateのリセット
    resetState();
    // sessionStorageのクリア
    window.sessionStorage.clear();
    navigate("/");
  };

  /**
   * 一時的な鍵ペアを生成
   */
  const generateEphemeralKeyPair = () => {
    const newEphemeralKeyPair = Ed25519Keypair.generate();
    window.sessionStorage.setItem(
      KEY_PAIR_SESSION_STORAGE_KEY,
      newEphemeralKeyPair.export().privateKey,
    );
    setEphemeralKeyPair(newEphemeralKeyPair);
  };

  /**
   * 一時的な鍵ペアをクリア
   */
  const clearEphemeralKeyPair = () => {
    window.sessionStorage.removeItem(KEY_PAIR_SESSION_STORAGE_KEY);
    setEphemeralKeyPair(undefined);
  };

  /**
   * 現在のエポックを取得
   */
  const fetchCurrentEpoch = async () => {
    // Sui ClientのgetLatestSuiSystemStateメソッドを呼び出す
    const { epoch } = await suiClient.getLatestSuiSystemState();
    setCurrentEpoch(epoch);
    setMaxEpoch(Number(epoch) + 10);
  };

  /**
   * ランダムネス値を生成
   */
  const generateRandomnessValue = () => {
    const newRandomness = generateRandomness();
    window.sessionStorage.setItem(
      RANDOMNESS_SESSION_STORAGE_KEY,
      newRandomness,
    );
    setRandomness(newRandomness);
  };

  /**
   * ナンス値を生成
   * @returns
   */
  const generateNonceValue = () => {
    if (!ephemeralKeyPair) return;
    const newNonce = generateNonce(
      ephemeralKeyPair.getPublicKey(),
      maxEpoch,
      randomness,
    );
    setNonce(newNonce);
  };

  /**
   * JWTからウォレットアドレレスを生成s
   * @returns
   */
  const generateZkLoginAddress = () => {
    if (!userSalt || !jwtString) return;

    // JWTからウォレットアドレスを生成
    const zkLoginAddress = jwtToAddress(jwtString, userSalt);
    console.log("ZKLoginAddress:", zkLoginAddress);
    setZkLoginUserAddress(zkLoginAddress);
  };

  /**
   * ZKプルーフを取得
   */
  const fetchZkProof = async () => {
    try {
      setFetchingZKProof(true);
      const zkProofResult = await axios.post(
        SUI_PROVER_DEV_ENDPOINT,
        {
          jwt: oauthParams?.id_token as string,
          extendedEphemeralPublicKey: extendedEphemeralPublicKey,
          maxEpoch: maxEpoch,
          jwtRandomness: randomness,
          salt: userSalt,
          keyClaimName: "sub",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      setZkProof(zkProofResult.data as PartialZkLoginSignature);
      // enqueueSnackbar("Successfully obtain ZK Proof", {
      //   variant: "success",
      // });
    } catch (error: unknown) {
      console.error(error);
      // enqueueSnackbar(errorMessage, {
      //   variant: "error",
      // });
    } finally {
      setFetchingZKProof(false);
    }
  };

  const contextValue: GlobalContextType = {
    // State
    currentEpoch,
    nonce,
    oauthParams,
    zkLoginUserAddress,
    decodedJwt,
    jwtString,
    ephemeralKeyPair,
    userSalt,
    zkProof,
    extendedEphemeralPublicKey,
    maxEpoch,
    randomness,
    activeStep,
    fetchingZKProof,
    executingTxn,
    executeDigest,
    user,
    session,
    loading,

    // State setters
    setCurrentEpoch,
    setNonce,
    setOauthParams,
    setZkLoginUserAddress,
    setDecodedJwt,
    setJwtString,
    setEphemeralKeyPair,
    setUserSalt,
    setZkProof,
    setExtendedEphemeralPublicKey,
    setMaxEpoch,
    setRandomness,
    setActiveStep,
    setFetchingZKProof,
    setExecutingTxn,
    setExecuteDigest,
    setUser,
    setSession,
    setLoading,

    // Methods
    resetState,
    signOut,
    generateEphemeralKeyPair,
    clearEphemeralKeyPair,
    fetchCurrentEpoch,
    generateRandomnessValue,
    generateNonceValue,
    generateZkLoginAddress,
    generateExtendedEphemeralPublicKey:
      generateExtendedEphemeralPublicKeyCallback,
    fetchZkProof,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}
