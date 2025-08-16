import { Box, Button } from "@mui/material";
import { SUI_DEVNET_FAUCET } from "../utils/constant";


export function FaucetLinkButton() {
  return (
    <Box sx={{ mt: { xs: 2, md: 4 }, textAlign: "center" }}>
      <Button
        variant="outlined"
        color="primary"
        href={SUI_DEVNET_FAUCET}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          px: 4,
          py: 1.5,
          fontSize: { xs: "1rem", md: "1.1rem" },
          fontWeight: 700,
          borderRadius: 3,
          boxShadow: "0 2px 12px #6366f133",
          border: "2px solid",
          borderImage: "linear-gradient(90deg, #06b6d4 0%, #6366f1 100%) 1",
          color: "#0ea5e9",
          background: "#fff",
          transition: "all 0.2s",
          ':hover': {
            background: "linear-gradient(90deg, #e0e7ff 0%, #f0fdfa 100%)",
            color: "#6366f1",
            borderColor: "#6366f1",
          },
        }}
      >
        Get SUI from Faucet
      </Button>
    </Box>
  );
}
