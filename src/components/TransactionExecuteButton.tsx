import SendIcon from "@mui/icons-material/Send";
import { LoadingButton } from "@mui/lab";

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
    <LoadingButton
      fullWidth
      loading={executingTxn}
      variant="contained"
      color="primary"
      disabled={!decodedJwt}
      sx={{
        py: 1.5,
        fontSize: "1rem",
        fontWeight: 600,
        borderRadius: 2,
        textTransform: "none",
      }}
      startIcon={<SendIcon />}
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
      Execute Transaction
    </LoadingButton>
  );
}
