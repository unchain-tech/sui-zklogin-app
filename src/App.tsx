import { Box, Button, Stack, Typography } from "@mui/material";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useState } from "react";
import { FaucetLinkButton } from "./components/FaucetLinkButton";
import { GoogleLoginButton } from "./components/GoogleLoginButton";
import { ResetDialog } from "./components/ResetDialog";
import { ShowBalance } from "./components/ShowBalance";
import { TransactionExecuteButton } from "./components/TransactionExecuteButton";
import { useGlobalContext } from "./hooks/useGlobalContext";
import { useSui } from "./hooks/useSui";
import { useZKLogin } from "./hooks/useZKLogin";
import "./style/App.css";
import { base, gray } from "./utils/theme/colors";

/**
 * App Component
 * @returns
 */
function App() {
  // GlobalProvider から状態とメソッドを取得
  const {
    // 状態
    zkLoginUserAddress,
    decodedJwt,
    ephemeralKeyPair,
    userSalt,
    zkProof,
    maxEpoch,
    executingTxn,
    executeDigest,
    // State setters
    setExecutingTxn,
    setExecuteDigest,
    // メソッド
    resetLocalState,
  } = useGlobalContext();

  // ローカルな状態（Dialog表示のみ）
  const [showResetDialog, setShowResetDialog] = useState(false);

  // useSui hook を使用
  const { executeTransaction } = useSui();

  // useZKLogin hook を使用
  const { login } = useZKLogin();

  // query zkLogin address balance
  const { data: addressBalance } = useSuiClientQuery(
    "getBalance",
    {
      owner: zkLoginUserAddress,
    },
    {
      enabled: Boolean(zkLoginUserAddress),
      refetchInterval: 1500,
    },
  );

  return (
    <Box>
      <Box
        sx={{
          mb: "36px",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            sx={{
              fontSize: "2rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              columnGap: "16px",
            }}
          >
            ZKLogin Demo App{" "}
            <Typography
              sx={{
                color: base.white,
                background: gray[900],
                p: "4px 8px",
                fontWeight: 400,
                fontSize: "0.75rem",
                borderRadius: "4px",
              }}
            >
              Devnet
            </Typography>
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              setShowResetDialog(true);
            }}
          >
            Reset LocalState
          </Button>
          <ResetDialog
            open={showResetDialog}
            onClose={() => setShowResetDialog(false)}
            onConfirm={resetLocalState}
          />
        </Stack>
      </Box>
      <ShowBalance
        zkLoginUserAddress={zkLoginUserAddress}
        addressBalance={addressBalance}
      />
      <FaucetLinkButton />
      <GoogleLoginButton login={login} />
      <TransactionExecuteButton
        executingTxn={executingTxn}
        decodedJwt={decodedJwt}
        ephemeralKeyPair={ephemeralKeyPair}
        zkProof={zkProof}
        userSalt={userSalt}
        zkLoginUserAddress={zkLoginUserAddress}
        maxEpoch={maxEpoch}
        executeTransaction={executeTransaction}
        setExecutingTxn={setExecutingTxn}
        setExecuteDigest={setExecuteDigest}
        executeDigest={executeDigest}
      />
    </Box>
  );
}

export default App;
