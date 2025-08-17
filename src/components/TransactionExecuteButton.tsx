import { LoadingButton } from "@mui/lab";
import { Box } from "@mui/material";

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
}: TransactionExecuteButtonProps) {
  return (
    <Box sx={{ mt: { xs: 2, md: 4 }, textAlign: "center" }}>
      <LoadingButton
        loading={executingTxn}
        variant="contained"
        disabled={!decodedJwt}
        sx={{
          px: 4,
          py: 1.5,
          fontSize: { xs: "1rem", md: "1.15rem" },
          fontWeight: 700,
          borderRadius: 3,
          boxShadow: "0 2px 12px #6366f133",
          background: "linear-gradient(90deg, #06b6d4 0%, #6366f1 100%)",
          color: "#fff",
          transition: "all 0.2s",
          ":hover": {
            background: "linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)",
            color: "#fff",
          },
        }}
        onClick={() => {
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
          }
        }}
      >
        Execute Transaction Block
      </LoadingButton>
    </Box>
  );
}
