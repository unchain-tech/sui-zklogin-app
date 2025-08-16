import { Box, Button } from "@mui/material";
import GoogleLogo from "../assets/google.svg";

interface GoogleLoginButtonProps {
  login: () => Promise<void>;
}

export function GoogleLoginButton({ login }: GoogleLoginButtonProps) {
  return (
    <Box sx={{ mt: { xs: 2, md: 4 }, textAlign: "center" }}>
      <Button
        variant="contained"
        onClick={async () => await login()}
        sx={{
          px: 4,
          py: 1.5,
          fontSize: { xs: "1rem", md: "1.15rem" },
          fontWeight: 700,
          borderRadius: 3,
          boxShadow: "0 2px 12px #6366f133",
          background: "linear-gradient(90deg, #fbbf24 0%, #6366f1 100%)",
          color: "#fff",
          gap: 2,
          transition: "all 0.2s",
          ":hover": {
            background: "linear-gradient(90deg, #6366f1 0%, #fbbf24 100%)",
            color: "#fff",
          },
        }}
        startIcon={
          <img
            src={GoogleLogo}
            width={24}
            height={24}
            alt="Google"
            style={{ borderRadius: 4, boxShadow: "0 1px 4px #aaa" }}
          />
        }
      >
        Sign In With Google
      </Button>
    </Box>
  );
}
