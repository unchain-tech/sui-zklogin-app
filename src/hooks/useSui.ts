import { useSuiClientQuery } from "@mysten/dapp-kit";
import type { SerializedSignature } from "@mysten/sui.js/cryptography";
import type { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { MIST_PER_SUI } from "@mysten/sui.js/utils";
import { genAddressSeed, getZkLoginSignature } from "@mysten/zklogin";
import type { JwtPayload } from "jwt-decode";
import { enqueueSnackbar } from "notistack";
import { useCallback } from "react";
import { suiClient } from "../lib/suiClient";
import type { PartialZkLoginSignature } from "../types/globalContext";

interface ExecuteTransactionParams {
  ephemeralKeyPair: Ed25519Keypair;
  zkProof: PartialZkLoginSignature;
  decodedJwt: JwtPayload;
  userSalt: string;
  zkLoginUserAddress: string;
  maxEpoch: number;
  setExecutingTxn: (loading: boolean) => void;
  setExecuteDigest: (digest: string) => void;
}

/**
 * Sui ブロックチェーンに関するReact Hookをまとめたカスタムフック
 * @returns {Object} - Contains the executeTransaction function
 */
export function useSui() {

  /**
   * 送金用のトランザクションを実行するメソッド
   */
  const executeTransaction = useCallback(
    async (params: ExecuteTransactionParams) => {
      const {
        ephemeralKeyPair,
        zkProof,
        decodedJwt,
        userSalt,
        zkLoginUserAddress,
        maxEpoch,
        setExecutingTxn,
        setExecuteDigest,
      } = params;

      try {
        if (!ephemeralKeyPair || !zkProof || !decodedJwt || !userSalt) {
          return;
        }

        setExecutingTxn(true);
        const txb = new TransactionBlock();
        // 送金用の額を指定
        const [coin] = txb.splitCoins(txb.gas, [MIST_PER_SUI * 1n]);
        // 検証用のコインオブジェクトを作成
        txb.transferObjects(
          [coin],
          "0x6c1aa061d0495b71eefd97e7d0a1cef0092f5c64d1b751decdc7b5ad0d039c02",
        );
        txb.setSender(zkLoginUserAddress);

        // トランザクションに署名する
        const { bytes, signature: userSignature } = await txb.sign({
          client: suiClient,
          // This must be the same ephemeral key pair used in the ZKP requests
          signer: ephemeralKeyPair,
        });

        if (!decodedJwt?.sub || !decodedJwt.aud) {
          return;
        }

        const addressSeed: string = genAddressSeed(
          BigInt(userSalt),
          "sub",
          decodedJwt.sub,
          decodedJwt.aud as string,
        ).toString();

        // ZKLogin用の署名データを生成する
        const zkLoginSignature: SerializedSignature = getZkLoginSignature({
          inputs: {
            ...zkProof,
            addressSeed,
          },
          maxEpoch,
          userSignature,
        });

        // トランザクションを送信する
        const executeRes = await suiClient.executeTransactionBlock({
          transactionBlock: bytes,
          signature: zkLoginSignature,
        });

        enqueueSnackbar(`Execution successful: ${executeRes.digest}`, {
          variant: "success",
        });
        setExecuteDigest(executeRes.digest);
      } catch (error) {
        console.error(error);
        enqueueSnackbar(String(error), {
          variant: "error",
        });
      } finally {
        setExecutingTxn(false);
      }
    },
    [],
  );

  return {
    executeTransaction,
  };
}

/**
 * ユーザーの残高を取得するメソッド
 * @param zkLoginUserAddress 
 * @returns 
 */
export function useGetBalance(zkLoginUserAddress: string) {
  const { data: addressBalance, ...rest } = useSuiClientQuery(
    "getBalance",
    { owner: zkLoginUserAddress },
    {
      enabled: Boolean(zkLoginUserAddress),
      refetchInterval: 1500,
    },
  );
  return { addressBalance, ...rest };
}