import { Box } from "@mui/material";
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
  } = useGlobalContext();

  // useSui hook を使用
  const { executeTransaction, mintNFT } = useSui();
  // useZKLogin hook を使用
  const { login } = useZKLogin();

  return (
    <Box>
      <Header />
      <ShowBalance
        zkLoginUserAddress={zkLoginUserAddress}
        addressBalance={useGetBalance(zkLoginUserAddress)?.addressBalance}
      />
      <NFTBalance zkLoginUserAddress={zkLoginUserAddress} />
      {zkLoginUserAddress && <FaucetLinkButton />}
      {!zkLoginUserAddress && <GoogleLoginButton login={login} />}
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
      <TransactionSuccessAlert executeDigest={executeDigest} />
    </Box>
  );
}

export default App;
