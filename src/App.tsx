import { LoadingButton } from "@mui/lab";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import GoogleLogo from "./assets/google.svg";
import { ResetDialog } from "./components/ResetDialog";
import { ShowBalance } from "./components/ShowBalance";
import { TransactionSuccessAlert } from "./components/TransactionSuccessAlert";
import { useGlobalContext } from "./hooks/useGlobalContext";
import { useSui } from "./hooks/useSui";
import "./style/App.css";
import { CLIENT_ID, REDIRECT_URI } from "./utils/constant";
import { base, gray } from "./utils/theme/colors";

/**
 * App Component
 * @returns
 */
function App() {
  // GlobalProvider から状態とメソッドを取得
  const {
    // 状態
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
    nextButtonDisabled,

    // State setters
    setActiveStep,
    setExecutingTxn,
    setExecuteDigest,

    // メソッド
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
  } = useGlobalContext();

  // ローカルな状態（Dialog表示のみ）
  const [showResetDialog, setShowResetDialog] = useState(false);

  // useSui hook を使用
  const { executeTransaction } = useSui();

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
            Sui zkLogin Demo{" "}
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
      <Box sx={{ mt: "24px" }}>
        <Button
          variant="outlined"
          disabled={activeStep === 0}
          onClick={() => {
            setActiveStep(activeStep - 1);
          }}
        >
          Back
        </Button>
        {activeStep !== 6 && (
          <Button
            sx={{
              ml: "12px",
            }}
            variant="outlined"
            disabled={nextButtonDisabled}
            onClick={() => {
              setActiveStep(activeStep + 1);
            }}
          >
            Next
          </Button>
        )}
      </Box>

      <ShowBalance
        zkLoginUserAddress={zkLoginUserAddress}
        addressBalance={addressBalance}
      />

      <Box
        sx={{
          mt: "24px",
          p: "12px",
        }}
        className="border border-slate-300 rounded-xl"
      >
        
        {/* Step 2 */}
        {activeStep === 1 && (
          <Stack spacing={2}>
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 600,
                mb: "12px !important",
              }}
            >
              Step 2: Fetch JWT (from OpenID Provider)
            </Typography>
            <Typography>Required parameters:</Typography>
            <Stack spacing={1}>
              <Typography>
                1. {"  "}
                <code>$CLIENT_ID</code> (Obtained by applying for OpenID
                Service.)
              </Typography>
              <Typography>
                2. <code>$REDIRECT_URL</code> (App Url, configured in OpenID
                Service)
              </Typography>
              <Typography>
                3. <code>$NONCE</code> (Generated through{" "}
                <code>ephemeralKeyPair</code>, <code>maxEpoch</code>, and{" "}
                <code>randomness</code>)
              </Typography>
              <Stack
                spacing={1}
                sx={{
                  m: "12px 0px !important",
                }}
              >
                <Typography>
                  <code>*ephemeralKeyPair</code>: Ephemeral key pair generated
                  in the previous step
                </Typography>
                <Typography>
                  <code>*maxEpoch</code>: Validity period of the ephemeral key
                  pair
                </Typography>
                <Typography>
                  <code>*randomness</code>: Randomness
                </Typography>
              </Stack>
            </Stack>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                flexDirection: "column",
              }}
            >
              <Button
                variant="contained"
                size="small"
                onClick={fetchCurrentEpoch}
              >
                {"Fetch current Epoch (via Sui Client)"}
              </Button>
              <Box sx={{ mt: "6px" }}>
                {"Current Epoch:"}{" "}
                <code>
                  {currentEpoch || "Click the button above to obtain"}
                </code>
              </Box>
              <Typography sx={{ mt: "6px" }}>
                {"Assuming the validity period is set to 10 Epochs, then:"}{" "}
                <code>maxEpoch:{maxEpoch}</code>
              </Typography>
            </Box>
            <Box
              sx={{
                mt: "16px",
              }}
            >
              <SyntaxHighlighter
                wrapLongLines
                language="typescript"
                style={oneDark}
              >
                {`import { generateRandomness } from '@mysten/zklogin';
                
 // randomness
 const randomness = generateRandomness();`}
              </SyntaxHighlighter>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                size="small"
                onClick={generateRandomnessValue}
              >
                {"Generate randomness"}
              </Button>
              <Typography>
                <code>randomness: {randomness}</code>
              </Typography>
            </Stack>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button
                  variant="contained"
                  disabled={
                    !ephemeralKeyPair ||
                    !maxEpoch ||
                    !currentEpoch ||
                    !randomness
                  }
                  onClick={generateNonceValue}
                >
                  Generate Nonce
                </Button>
                {nonce && (
                  <Typography>
                    nonce: <code>{nonce}</code>
                  </Typography>
                )}
              </Stack>
              <Button
                sx={{
                  mt: "24px",
                }}
                disabled={!nonce}
                variant="contained"
                onClick={() => {
                  const params = new URLSearchParams({
                    client_id: CLIENT_ID,
                    redirect_uri: REDIRECT_URI,
                    response_type: "id_token",
                    scope: "openid",
                    nonce: nonce,
                  });
                  const loginURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
                  window.location.replace(loginURL);
                }}
              >
                <img
                  src={GoogleLogo}
                  width="16px"
                  style={{
                    marginRight: "8px",
                  }}
                  alt="Google"
                />{" "}
                Sign In With Google
              </Button>
            </Box>
          </Stack>
        )}
      {/* Step 7 */}
      {activeStep === 6 && (
        <Box>
          <Typography
            sx={{
                fontSize: "1.25rem",
                fontWeight: 600,
                mb: "12px !important",
              }}
            >
              {"Step 7: Assemble zkLogin signature and submit the transaction"}
            </Typography>
            <Alert severity="warning">
              {
                "Each ZK Proof is associated with an ephemeral key pair. Stored in the appropriate location, it can be reused as proof to sign any number of transactions until the ephemeral key pair expires."
              }
            </Alert>
            <Typography sx={{ mt: "12px" }}>
              {
                "Before executing the transaction, please recharge zkLogin with a small amount of SUI as the gas fee for initiating the transaction."
              }
            </Typography>
            <div className="card">
              <LoadingButton
                loading={executingTxn}
                variant="contained"
                disabled={!decodedJwt}
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
              <TransactionSuccessAlert executeDigest={executeDigest} />
            </div>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;
