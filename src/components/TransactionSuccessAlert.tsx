import { Alert, Typography } from "@mui/material";

interface TransactionSuccessAlertProps {
  executeDigest: string;
}

export function TransactionSuccessAlert({
  executeDigest,
}: TransactionSuccessAlertProps) {
  if (!executeDigest) {
    return null;
  }

  return (
    <Alert severity="success" sx={{ mt: "12px" }}>
      Execution successful:{" "}
      <Typography
        component="span"
        sx={{
          fontFamily: "'Noto Sans Mono', monospace;",
          fontWeight: 600,
        }}
      >
        <a
          href={`https://suiexplorer.com/txblock/${executeDigest}?network=devnet`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {executeDigest}
        </a>
      </Typography>
    </Alert>
  );
}
