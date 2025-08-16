import { Stack, Typography } from "@mui/material";
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
  if (!zkLoginUserAddress) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1} sx={{ mt: "24px" }}>
      <Typography>
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
      </Typography>
      {addressBalance && (
        <Typography>
          Balance:{" "}
          {BigNumber(addressBalance?.totalBalance)
            .div(MIST_PER_SUI.toString())
            .toFixed(6)}{" "}
          SUI
        </Typography>
      )}
    </Stack>
  );
}
