import { Box, Container, Grid, Stack } from "@mui/material";
import { Header } from "./components/Header";
import { TransactionSuccessAlert } from "./components/TransactionSuccessAlert";
import "./style/App.css";

/**
 * App コンポーネント
 * @returns
 */
function App() {
  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh" }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Stack spacing={4}>
              {/* ここに AccountInformationCard コンポーネントを追加する */}
              {/* ここに ActionsCard コンポーネントを追加する */}
            </Stack>
          </Grid>
        </Grid>
      </Container>
      <TransactionSuccessAlert />
    </Box>
  );
}

export default App;
