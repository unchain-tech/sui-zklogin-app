import { Box, Button } from "@mui/material";
import { SUI_DEVNET_FAUCET } from "../utils/constant";

export function FaucetLinkButton() {
  return (
    <Box sx={{ mt: "24px" }}>
      <Button
        variant="outlined"
        color="primary"
        href={SUI_DEVNET_FAUCET}
        target="_blank"
        rel="noopener noreferrer"
      >
        Get SUI from Faucet
      </Button>
    </Box>
  );
}
