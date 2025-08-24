import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { NFTBalance, ShowBalance } from "./components/Balance";
import { FaucetLinkButton } from "./components/FaucetLinkButton";
import { GoogleLoginButton } from "./components/GoogleLoginButton";
import { Header } from "./components/Header";
import { NFTMintButton } from "./components/NFTMintButton";
import { TransactionExecuteButton } from "./components/TransactionExecuteButton";
import { TransactionSuccessAlert } from "./components/TransactionSuccessAlert";
import { useGlobalContext } from "./hooks/useGlobalContext";
import { useGetBalance, useSui } from "./hooks/useSui";
import { useZKLogin } from "./hooks/useZKLogin";
import "./style/App.css";

/**
 * App コンポーネント
 * @returns
 */
function App() {
  const {
    zkLoginUserAddress,
    decodedJwt,
    ephemeralKeyPair,
    userSalt,
    zkProof,
    maxEpoch,
    executingTxn,
    executeDigest,
    setExecutingTxn,
    setExecuteDigest,
  } = useGlobalContext();

  const { executeTransaction, mintNFT } = useSui();
  const { startLogin } = useZKLogin();
  const { addressBalance } = useGetBalance(zkLoginUserAddress);

  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh" }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Stack spacing={4}>
              {/* Account Information Card */}
              {zkLoginUserAddress && (
                <Card elevation={3}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h5" component="div">
                        Account
                      </Typography>
                      <ShowBalance
                        zkLoginUserAddress={zkLoginUserAddress}
                        addressBalance={addressBalance}
                      />
                      <NFTBalance zkLoginUserAddress={zkLoginUserAddress} />
                      <FaucetLinkButton />
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Actions Card */}
              <Card elevation={3}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h5" component="div">
                      Actions
                    </Typography>
                    {!zkLoginUserAddress ? (
                      <GoogleLoginButton login={startLogin} />
                    ) : (
                      <>
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
                        />
                        <NFTMintButton
                          executingTxn={executingTxn}
                          decodedJwt={decodedJwt}
                          ephemeralKeyPair={ephemeralKeyPair}
                          zkProof={zkProof}
                          userSalt={userSalt}
                          zkLoginUserAddress={zkLoginUserAddress}
                          maxEpoch={maxEpoch}
                          mintNFT={mintNFT}
                          setExecutingTxn={setExecutingTxn}
                          setExecuteDigest={setExecuteDigest}
                        />
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      <TransactionSuccessAlert executeDigest={executeDigest} />
    </Box>
  );
}

export default App;
