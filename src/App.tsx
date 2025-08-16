import { Box } from "@mui/material";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { FaucetLinkButton } from "./components/FaucetLinkButton";
import { GoogleLoginButton } from "./components/GoogleLoginButton";
import { Header } from "./components/Header";
import { ShowBalance } from "./components/ShowBalance";
import { TransactionExecuteButton } from "./components/TransactionExecuteButton";
import { useGlobalContext } from "./hooks/useGlobalContext";
import { useSui } from "./hooks/useSui";
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
      <Header />
      <ShowBalance
        zkLoginUserAddress={zkLoginUserAddress}
        addressBalance={addressBalance}
      />
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
        executeDigest={executeDigest}
      />
    </Box>
  );
}

export default App;
