import { LoadingButton } from "@mui/lab";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui.js/client";
import type { SerializedSignature } from "@mysten/sui.js/cryptography";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { MIST_PER_SUI } from "@mysten/sui.js/utils";
import { genAddressSeed, getZkLoginSignature } from "@mysten/zklogin";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import GoogleLogo from "./assets/google.svg";
import { ResetDialog } from "./components/ResetDialog";
import { ShowBalance } from "./components/ShowBalance";
import { useGlobalContext } from "./hooks/useGlobalContext";
import "./style/App.css";
import { CLIENT_ID, FULLNODE_URL, REDIRECT_URI } from "./utils/constant";
import { base, gray } from "./utils/theme/colors";

// SuiClient instance
const suiClient = new SuiClient({ url: FULLNODE_URL });

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
        {/* Step 1 */}
        {activeStep === 0 && (
          <Stack spacing={2}>
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 600,
                mb: "12px !important",
              }}
            >
              Step 1: Generate Ephemeral Key Pair
            </Typography>
            <Typography>
              The ephemeral key pair is used to sign the{" "}
              <code>TransactionBlock</code>
            </Typography>
            <Typography>
              Stored in the browser session (Session Storage)
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                disabled={Boolean(ephemeralKeyPair)}
                onClick={generateEphemeralKeyPair}
              >
                Create random ephemeral KeyPair{" "}
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={!ephemeralKeyPair}
                onClick={clearEphemeralKeyPair}
              >
                Clear ephemeral KeyPair{" "}
              </Button>
            </Stack>
          </Stack>
        )}
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
        {/* Step 3 */}
        {activeStep === 2 && (
          <Box>
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 600,
                mb: "12px !important",
              }}
            >
              {
                "Step 3: Decode JWT (needed for assembling zkLogin signature later)"
              }
            </Typography>
            {decodedJwt && (
              <Alert
                variant="standard"
                color="success"
                sx={{
                  fontWeight: 600,
                }}
              >
                Successfully logged in via Google!
              </Alert>
            )}
            <Box sx={{ m: "16px 0" }}>
              UrlQuery: <code>id_token</code>
            </Box>
            <SyntaxHighlighter
              wrapLongLines
              wrapLines
              language="typescript"
              style={oneDark}
            >
              {`// id_token Header.Payload.Signature
${JSON.stringify(jwtString)}

import { JwtPayload, jwtDecode } from "jwt-decode";

const jwtPayload = jwtDecode(id_token);
const decodedJwt = jwt_decode(jwtPayload) as JwtPayload;`}
            </SyntaxHighlighter>
            <SyntaxHighlighter wrapLongLines language="json" style={oneDark}>
              {`// JWT Payload
${JSON.stringify(decodedJwt, null, 2)}`}
            </SyntaxHighlighter>
            <Stack
              spacing={1}
              sx={{
                m: "24px 0",
              }}
            >
              <Typography>
                <code>iss (issuer)</code>：<b>{"Issuer"}</b>
              </Typography>
              <Typography>
                <code>aud (audience)</code>：<b>{"JWT Consumer (CLIENT_ID)"}</b>
              </Typography>
              <Typography>
                <code>sub (subject)</code>：
                <b>{"Subject (user identifier, unique for each user)"}</b>
              </Typography>
              <Typography>
                <code>nonce</code>：
                {
                  "Signature order (values generated by assembling URL parameters earlier)"
                }
              </Typography>
              <Typography>
                <code>nbf (Not Before)</code>：{"Issued At"}
              </Typography>
              <Typography>
                <code>iat(Issued At)</code>：{"Issued Time"}
              </Typography>
              <Typography>
                <code>exp (expiration time)</code>：{"Expiration Time"}
              </Typography>
              <Typography>
                <code>jti (JWT ID)</code>：{"JWT ID"}
              </Typography>
            </Stack>
          </Box>
        )}
        {/* Step 4 */}
        {activeStep === 3 && (
          <Stack spacing={2}>
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 600,
                mb: "12px !important",
              }}
            >
              {"Step 4: Generate User's Salt"}
            </Typography>
            <Typography>
              {
                "User Salt is used to eliminate the one-to-one correspondence between the OAuth identifier (sub) and the on-chain Sui address, avoiding linking Web2 credentials with Web3 credentials."
              }
            </Typography>
            <Alert
              severity="warning"
              sx={{
                fontWeight: 600,
              }}
            >
              {
                "Therefore, it is essential to safeguard the Salt. If lost, users won't be able to recover the address generated with the current Salt."
              }
            </Alert>
            <div>
              <Typography>Where to store:</Typography>
              <Typography>
                1. Ask users to remember (send to user's email)
              </Typography>
              <Typography>2. Store on client (browser)</Typography>
              <Typography>
                3. Save in APP Backend database, mapping one-to-one with UID
              </Typography>
            </div>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{
                mt: "12px!important",
              }}
            >
              <Button
                variant="contained"
                disabled={Boolean(userSalt)}
                onClick={generateUserSalt}
              >
                Generate User Salt
              </Button>
              <Button
                variant="contained"
                disabled={!userSalt}
                color="error"
                onClick={deleteUserSalt}
              >
                Delete User Salt
              </Button>
            </Stack>
            <Typography>
              User Salt: {userSalt && <code>{userSalt}</code>}
            </Typography>
          </Stack>
        )}
        {/* Step 5 */}
        {activeStep === 4 && (
          <Stack spacing={2}>
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 600,
                mb: "12px !important",
              }}
            >
              {"Step 5: Generate User's Sui Address"}
            </Typography>
            <Typography>
              The user's Sui address is determined by <code>sub</code>,{" "}
              <code>iss</code>,<code>aud</code> and <code>user_salt</code>{" "}
              together. For the same JWT,
              <code>sub</code>, <code>iss</code>, and <code>aud</code> will not
              change each time you log in.
            </Typography>
            <SyntaxHighlighter
              wrapLongLines
              language="typescript"
              style={oneDark}
            >
              {`import { jwtToAddress } from "@mysten/zklogin";

 const zkLoginUserAddress = jwtToAddress(jwt, userSalt);`}
            </SyntaxHighlighter>
            <Box>
              <Button
                variant="contained"
                disabled={
                  !userSalt || !jwtString || Boolean(zkLoginUserAddress)
                }
                onClick={generateZkLoginAddress}
              >
                {"Generate Sui Address"}
              </Button>
            </Box>
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              User Sui Address:{" "}
              {zkLoginUserAddress && (
                <code>
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: "'Noto Sans Mono', monospace;",
                      fontWeight: 600,
                    }}
                  >
                    {zkLoginUserAddress}
                  </Typography>
                </code>
              )}
            </Typography>
            {zkLoginUserAddress && (
              <Alert severity="success">
                Congratulations! At this stage, your Sui zkLogin address has
                been successfully generated.
                <br />
                You can click the button on the right of the address to claim a
                test SUI Coin.
                <br />
                If there's an error with the service, you can use the{" "}
                <b>devnet faucet</b>{" "}
                <a
                  href="https://discord.com/channels/916379725201563759/971488439931392130"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  (#Sui official discord)
                </a>{" "}
                to claim test Sui Token in order to proceed to the next step.
              </Alert>
            )}
          </Stack>
        )}
        {/* Step 6 */}
        {activeStep === 5 && (
          <Stack spacing={2}>
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 600,
                mb: "12px !important",
              }}
            >
              {"Step 6: Fetch ZK Proof (Groth16)"}
            </Typography>
            <Typography>
              {
                "This is the proof (ZK Proof) for the ephemeral key pair, used to demonstrate the validity of the ephemeral key pair."
              }
            </Typography>
            <Typography>
              {
                "1. First, generate the extended ephemeral public key as input for the ZKP."
              }
            </Typography>
            <SyntaxHighlighter
              wrapLongLines
              language="typescript"
              style={oneDark}
            >
              {`import { getExtendedEphemeralPublicKey } from "@mysten/zklogin";
              
 const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(
   ephemeralKeyPair.getPublicKey()
 );`}
            </SyntaxHighlighter>
            <Box>
              <Button
                variant="contained"
                onClick={generateExtendedEphemeralPublicKey}
              >
                {"Generate the extended ephemeral public key"}
              </Button>
              <Typography
                sx={{
                  mt: "12px",
                }}
              >
                extendedEphemeralPublicKey:
                {extendedEphemeralPublicKey && (
                  <code>{extendedEphemeralPublicKey}</code>
                )}
              </Typography>
            </Box>
            <Typography>
              {
                "Use the generated extended ephemeral public key (extendedEphemeralPublicKey) to generate ZK Proof. SUI provides a backend service (or you can run a Docker)."
              }
            </Typography>
            <LoadingButton
              loading={fetchingZKProof}
              variant="contained"
              disabled={
                !oauthParams?.id_token ||
                !extendedEphemeralPublicKey ||
                !maxEpoch ||
                !randomness ||
                !userSalt
              }
              onClick={fetchZkProof}
            >
              {"Fetch ZK Proof"}
            </LoadingButton>
            {zkProof && (
              <SyntaxHighlighter
                wrapLongLines
                language="typescript"
                style={oneDark}
              >
                {JSON.stringify(zkProof, null, 2)}
              </SyntaxHighlighter>
            )}
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
                onClick={async () => {
                  try {
                    if (
                      !ephemeralKeyPair ||
                      !zkProof ||
                      !decodedJwt ||
                      !userSalt
                    ) {
                      return;
                    }
                    setExecutingTxn(true);
                    const txb = new TransactionBlock();

                    const [coin] = txb.splitCoins(txb.gas, [MIST_PER_SUI * 1n]);
                    txb.transferObjects(
                      [coin],
                      "0xfa0f8542f256e669694624aa3ee7bfbde5af54641646a3a05924cf9e329a8a36",
                    );
                    txb.setSender(zkLoginUserAddress);

                    const { bytes, signature: userSignature } = await txb.sign({
                      client: suiClient,
                      signer: ephemeralKeyPair, // This must be the same ephemeral key pair used in the ZKP request
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

                    const zkLoginSignature: SerializedSignature =
                      getZkLoginSignature({
                        inputs: {
                          ...zkProof,
                          addressSeed,
                        },
                        maxEpoch,
                        userSignature,
                      });

                    const executeRes = await suiClient.executeTransactionBlock({
                      transactionBlock: bytes,
                      signature: zkLoginSignature,
                    });

                    enqueueSnackbar(
                      `Execution successful: ${executeRes.digest}`,
                      {
                        variant: "success",
                      },
                    );
                    setExecuteDigest(executeRes.digest);
                  } catch (error) {
                    console.error(error);
                    enqueueSnackbar(String(error), {
                      variant: "error",
                    });
                  } finally {
                    setExecutingTxn(false);
                  }
                }}
              >
                Execute Transaction Block
              </LoadingButton>
              {executeDigest && (
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
                    >
                      {executeDigest}
                    </a>
                  </Typography>
                </Alert>
              )}
            </div>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;
