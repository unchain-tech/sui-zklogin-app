import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { createNetworkConfig, SuiClientProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import { StyledSnackbarProvider } from "./components/StyledSnackbarProvider.tsx";
import { GlobalProvider } from "./context/GlobalProvider.tsx";
import "./style/index.css";
import ThemeConfig from "./utils/theme/index.ts";

// ネットワーク設定を読み込み
const { networkConfig } = createNetworkConfig({
  devnet: { url: getFullnodeUrl("devnet") },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider theme={createTheme(ThemeConfig)}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} network="devnet">
          <GlobalProvider>
            <StyledSnackbarProvider maxSnack={4} autoHideDuration={3000} />
            <Routes>
              <Route path="/" element={<App />}></Route>
            </Routes>
            <Analytics />
          </GlobalProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </BrowserRouter>,
);
