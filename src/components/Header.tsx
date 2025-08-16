import { Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import SuiLogo from "../assets/sui-logo-color.svg";
import { useGlobalContext } from "../hooks/useGlobalContext";
import { ResetDialog } from "./../components/ResetDialog";
import { base, gray } from "./../utils/theme/colors";

/**
 * ヘッダーコンポーネント
 */
export const Header = () => {
  const { resetLocalState } = useGlobalContext();
  const [showResetDialog, setShowResetDialog] = useState(false);

  return (
    <Box
      sx={{
        mb: "36px",
        borderRadius: 4,
        boxShadow: "0 2px 16px 0 rgba(60,60,120,0.08)",
        background: "linear-gradient(90deg, #e0e7ff 0%, #f0fdfa 100%)",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <img
          src={SuiLogo}
          alt="Sui"
          width={40}
          height={40}
          style={{ borderRadius: 8, boxShadow: "0 2px 8px #aaa" }}
        />
        <Typography
          sx={{
            fontSize: { xs: "1.5rem", md: "2rem" },
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: gray[900],
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          ZKLogin Demo App
          <Typography
            sx={{
              color: base.white,
              background: "linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)",
              p: "4px 12px",
              fontWeight: 500,
              fontSize: "0.85rem",
              borderRadius: "8px",
              ml: 2,
              boxShadow: "0 1px 4px #6366f133",
            }}
          >
            Devnet
          </Typography>
        </Typography>
      </Stack>
      <Button
        variant="contained"
        color="error"
        size="medium"
        sx={{
          borderRadius: 3,
          fontWeight: 600,
          px: 3,
          boxShadow: "0 1px 8px #ef444433",
          transition: "all 0.2s",
          ":hover": {
            background: "linear-gradient(90deg, #f87171 0%, #fbbf24 100%)",
            color: base.white,
          },
        }}
        onClick={() => setShowResetDialog(true)}
      >
        Logout
      </Button>
      <ResetDialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={resetLocalState}
      />
    </Box>
  );
};
