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
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { GlobalContextType, PartialZkLoginSignature } from "../types/globalContext";
import { CLIENT_ID, FULLNODE_URL, REDIRECT_URI, SUI_PROVER_DEV_ENDPOINT } from "../utils/constant";

// SuiClient instance
const suiClient = new SuiClient({ url: FULLNODE_URL });

import { GlobalContext } from "../types/globalContext";
import {
  KEY_PAIR_SESSION_STORAGE_KEY,
  MAX_EPOCH_LOCAL_STORAGE_KEY,
  RANDOMNESS_SESSION_STORAGE_KEY,
  USER_SALT_LOCAL_STORAGE_KEY,
} from "../utils/constant";

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

  // nonce生成: 鍵ペア・maxEpoch・randomnessが揃ったら自動生成
  useEffect(() => {
    const hasIdToken = window.location.hash.includes("id_token=");
    if (!hasIdToken && ephemeralKeyPair && maxEpoch && randomness) {
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
      const zkLoginAddress = jwtToAddress(jwtString, userSalt);
      setZkLoginUserAddress(zkLoginAddress);
    }
  }, [jwtString, userSalt]);
  const [fetchingZKProof, setFetchingZKProof] = useState(false);
  const [executingTxn, setExecutingTxn] = useState(false);
  const [executeDigest, setExecuteDigest] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Location の監視（OAuth パラメータの取得）
  useEffect(() => {
  const res = queryString.parse(location.hash.replace(/^#/, ""));
    setOauthParams(res);
  }, [location]);

  // JWT トークンの処理
  useEffect(() => {
    if (oauthParams?.id_token) {
      const decodedJwt = jwtDecode(oauthParams.id_token as string);
      setJwtString(oauthParams.id_token as string);
      setDecodedJwt(decodedJwt);
      setActiveStep(2);
    }
  }, [oauthParams]);

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

    const savedUserSalt = window.localStorage.getItem(
      USER_SALT_LOCAL_STORAGE_KEY,
    );
    if (savedUserSalt) {
      setUserSalt(savedUserSalt);
    }

    const savedMaxEpoch = window.localStorage.getItem(
      MAX_EPOCH_LOCAL_STORAGE_KEY,
    );
    if (savedMaxEpoch) {
      setMaxEpoch(Number(savedMaxEpoch));
    }
  }, []);

  // Next ボタンの無効化判定
  const nextButtonDisabled = useMemo(() => {
    switch (activeStep) {
      case 0:
        return !ephemeralKeyPair;
      case 1:
        return !currentEpoch || !randomness;
      case 2:
        return !jwtString;
      case 3:
        return !userSalt;
      case 4:
        return !zkLoginUserAddress;
      case 5:
        return !zkProof;
      case 6:
        return true;
      default:
        return false;
    }
  }, [
    currentEpoch,
    randomness,
    activeStep,
    jwtString,
    ephemeralKeyPair,
    zkLoginUserAddress,
    zkProof,
    userSalt,
  ]);

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
   * ローカルストレージの内容をリセット
   */
  const resetLocalState = () => {
    try {
      window.sessionStorage.clear();
      window.localStorage.clear();
      resetState();
      navigate("/");
      setActiveStep(0);
      enqueueSnackbar("Reset successful", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(String(error), {
        variant: "error",
      });
    }
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
    window.localStorage.setItem(
      MAX_EPOCH_LOCAL_STORAGE_KEY,
      String(Number(epoch) + 10),
    );
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
   * ユーザーのソルトを生成
   */
  const generateUserSalt = () => {
    const salt = generateRandomness();
    window.localStorage.setItem(USER_SALT_LOCAL_STORAGE_KEY, salt);
    setUserSalt(salt);
  };

  /**
   * ユーザーのソルトをローカルストレージから削除
   */
  const deleteUserSalt = () => {
    window.localStorage.removeItem(USER_SALT_LOCAL_STORAGE_KEY);
    setUserSalt(undefined);
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
   * 一時鍵ペアから拡張公開鍵を生成
   * @returns
   */
  const generateExtendedEphemeralPublicKey = () => {
    if (!ephemeralKeyPair) return;
    // 一時鍵ペアから拡張公開鍵を生成
    const extendedKey = getExtendedEphemeralPublicKey(
      ephemeralKeyPair.getPublicKey(),
    );
    setExtendedEphemeralPublicKey(extendedKey);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Computed values
    nextButtonDisabled,

    // Methods
    resetState,
    resetLocalState,
    generateEphemeralKeyPair,
    clearEphemeralKeyPair,
    fetchCurrentEpoch,
    generateRandomnessValue,
    generateNonceValue,
    generateUserSalt,
    deleteUserSalt,
    generateZkLoginAddress,
    generateExtendedEphemeralPublicKey,
    fetchZkProof,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}
