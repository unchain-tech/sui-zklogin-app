import { Box, Typography } from "@mui/material";
import { MIST_PER_SUI } from "@mysten/sui.js/utils";
import { BigNumber } from "bignumber.js";

interface ShowBalanceProps {
  zkLoginUserAddress: string;
  addressBalance?: {
    totalBalance: string;
  };
}

export function ShowBalance({
  zkLoginUserAddress,
  addressBalance,
}: ShowBalanceProps) {
  if (!zkLoginUserAddress) return null;

  return (
    <Box
      sx={{
        mt: { xs: 2, md: 4 },
        p: { xs: 2, md: 3 },
        borderRadius: 4,
        boxShadow: "0 2px 16px 0 rgba(60,60,120,0.10)",
        background: "linear-gradient(90deg, #f0fdfa 0%, #e0e7ff 100%)",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        gap: 2,
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Noto Sans Mono', monospace;",
          fontWeight: 700,
          fontSize: { xs: "1rem", md: "1.1rem" },
          color: "#6366f1",
          letterSpacing: "0.02em",
          wordBreak: "break-all",
        }}
      >
        {zkLoginUserAddress}
      </Typography>
      {addressBalance && (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: { xs: "1rem", md: "1.1rem" },
            color: "#0ea5e9",
            ml: { md: 2 },
          }}
        >
          Balance:{" "}
          {BigNumber(addressBalance?.totalBalance)
            .div(MIST_PER_SUI.toString())
            .toFixed(6)}{" "}
          SUI
        </Typography>
      )}
    </Box>
  );
}
