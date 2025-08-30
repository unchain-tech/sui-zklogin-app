import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import {
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  jwtToAddress,
} from "@mysten/zklogin";
import type { Session, User } from "@supabase/supabase-js";
import axios from "axios";
import { Buffer } from "buffer";
import type { JwtPayload } from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import { enqueueSnackbar } from "notistack";
import queryString from "query-string";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { suiClient } from "../lib/suiClient";
import { supabase } from "../lib/supabaseClient";
import type {
  GlobalContextType,
  PartialZkLoginSignature,
} from "../types/globalContext";
import { GlobalContext } from "../types/globalContext";
import {
  CLIENT_ID,
  KEY_PAIR_SESSION_STORAGE_KEY,
  RANDOMNESS_SESSION_STORAGE_KEY,
  REDIRECT_URI,
  SUI_PROVER_DEV_ENDPOINT,
} from "../utils/constant";

// Provider Props の型定義
interface GlobalProviderProps {
  children: ReactNode;
}

/**
 * Global Provider コンポーネント
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
  const [activeStep] = useState(0);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingZKProof, setFetchingZKProof] = useState(false);
  const [executingTxn, setExecutingTxn] = useState(false);
  const [executeDigest, setExecuteDigest] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  /**
   * 一時的な鍵ペアを生成するメソッド
   */
  const generateEphemeralKeyPair = () => {
   
  };

  /**
   * 一時的な鍵ペアをクリアするメソッド
   */
  const clearEphemeralKeyPair = () => {
    
  };

  /**
   * 現在のエポックを取得するメソッド
   */
  const fetchCurrentEpoch = async () => {
    
  };

  /**
   * ランダムネス値を生成するメソッド
   */
  const generateRandomnessValue = () => {
   
  };

  /**
   * ナンス値を生成するメソッド
   * @returns
   */
  const generateNonceValue = () => {
   
  };

  useEffect(() => {
   
  }, []);

  // nonce生成: 鍵ペア・maxEpoch・randomnessが揃ったら自動生成
  useEffect(() => {
   
  }, [ephemeralKeyPair, maxEpoch, randomness]);

  // Google OAuthリダイレクト: nonceが生成されたら自動実行
  useEffect(() => {
    
  }, [nonce]);

  // ZKLoginアドレス生成: jwtStringとuserSaltが揃ったら自動生成
  useEffect(() => {
   
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
    console.log("ZKProof auto-fetch check:", {
      jwtString: !!jwtString,
      userSalt: !!userSalt,
      maxEpoch,
      ephemeralKeyPair: !!ephemeralKeyPair,
      extendedEphemeralPublicKey: !!extendedEphemeralPublicKey,
      randomness: !!randomness,
      zkProof: !!zkProof,
    });

    if (
      jwtString &&
      userSalt &&
      maxEpoch &&
      ephemeralKeyPair &&
      extendedEphemeralPublicKey &&
      randomness &&
      !zkProof
    ) {
      console.log("Triggering ZKProof fetch...");
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

  /**
   * zkLoginデータをSupabaseに保存する関数
   * @param userId
   * @returns
   */
  const saveZkLoginData = useCallback(
    async (userId: string, userSalt: string, maxEpoch: number) => {
      
    },
    [],
  );

  /**
   * zkLoginデータをSupabaseから取得する関数
   * @param userId
   * @returns
   */
  const fetchZkLoginData = useCallback(
    async (
      userId: string,
    ): Promise<{ user_salt: string; max_epoch: number } | null> => {
      
    },
    [saveZkLoginData],
  );

  // Location の監視（OAuth パラメータの取得）
  useEffect(() => {
    const res = queryString.parse(location.hash.replace(/^#/, ""));
    setOauthParams(res);
  }, [location]);

  // JWT トークンの処理
  useEffect(() => {
    /**
     * zkLoginの認証処理に必要なデータを処理するためのメソッド
     * @param userId
     */
    const initializeZkLoginData = async (userId: string) => {
      
    }
  }, [oauthParams, fetchZkLoginData, saveZkLoginData]);

  /**
   * ログアウトしてステート変数の値をリセットするメソッド
   */
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
    0;
    setFetchingZKProof(false);
    setExecutingTxn(false);
    setExecuteDigest("");
  };

  /**
   * signOutするための関数
   */
  const signOut = async () => {
    // stateのリセット
    resetState();
    // sessionStorageのクリア
    window.sessionStorage.clear();
    navigate("/");
  };

  /**
   * JWTからウォレットアドレレスを生成するメソッド
   * @returns
   */
  const generateZkLoginAddress = () => {
    
  };

  // GlobalContextProviderから提供する変数・メソッド一覧を定義
  const contextValue: GlobalContextType = {
    // State
    

    // State setters
    

    // Methods
    
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}
