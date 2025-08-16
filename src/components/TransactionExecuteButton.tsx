import { LoadingButton } from "@mui/lab";
import { Box } from "@mui/material";
import { TransactionSuccessAlert } from "./TransactionSuccessAlert";

interface TransactionExecuteButtonProps {
  executingTxn: boolean;
  decodedJwt: unknown;
  ephemeralKeyPair: unknown;
  zkProof: unknown;
  userSalt: unknown;
  zkLoginUserAddress: string;
  maxEpoch: number;
  executeTransaction: (args: any) => void;
  setExecutingTxn: (v: boolean) => void;
  setExecuteDigest: (v: string) => void;
  executeDigest: string;
}

/**
 * TransactionExecuteButton Component
 * @param param0 - Props for the component
 * @returns JSX.Element
 */
export function TransactionExecuteButton({
  executingTxn,
  decodedJwt,
  ephemeralKeyPair,
  zkProof,
  userSalt,
  zkLoginUserAddress,
  maxEpoch,
  executeTransaction,
  setExecutingTxn,
  setExecuteDigest,
  executeDigest,
}: TransactionExecuteButtonProps) {
  return (
    <Box sx={{ mt: "24px" }}>
      <LoadingButton
        loading={executingTxn}
        variant="contained"
        disabled={!decodedJwt}
        onClick={() => {
          console.log("ephemeralKeyPair", ephemeralKeyPair);
          console.log("zkProof", zkProof);
          console.log("decodedJwt", decodedJwt);
          console.log("userSalt", userSalt);
          if (ephemeralKeyPair && zkProof && decodedJwt && userSalt) {
            executeTransaction({
              ephemeralKeyPair,
              zkProof,
              decodedJwt,
              userSalt,
              zkLoginUserAddress,
              maxEpoch,
              setExecutingTxn,
              setExecuteDigest,
            });
          } else {
            console.warn("Transaction prerequisites missing");
          }
        }}
      >
        Execute Transaction Block
      </LoadingButton>
      <TransactionSuccessAlert executeDigest={executeDigest} />
    </Box>
  );
}
