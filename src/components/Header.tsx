import { Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useGlobalContext } from "../hooks/useGlobalContext";
import { ResetDialog } from "./../components/ResetDialog";
import { base, gray } from "./../utils/theme/colors";

/**
 * ヘッダーコンポーネント
 */
export const Header = () => {
  // GlobalProvider から状態とメソッドを取得
  const { resetLocalState } = useGlobalContext();

  // ローカルな状態（Dialog表示のみ）
  const [showResetDialog, setShowResetDialog] = useState(false);

  return (
    <Box
      sx={{
        mb: "36px",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
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
          Logout
        </Button>
        <ResetDialog
          open={showResetDialog}
          onClose={() => setShowResetDialog(false)}
          onConfirm={resetLocalState}
        />
      </Stack>
    </Box>
  );
};
