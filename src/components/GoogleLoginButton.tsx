import { Box, Button } from "@mui/material";
import GoogleLogo from "../assets/google.svg";

interface GoogleLoginButtonProps {
  login: () => Promise<void>;
}

export function GoogleLoginButton({ login }: GoogleLoginButtonProps) {
  return (
    <Box sx={{ mt: "24px" }}>
      <Button variant="contained" onClick={async () => await login()}>
        <img
          src={GoogleLogo}
          width="16px"
          style={{ marginRight: "8px" }}
          alt="Google"
        />
        Sign In With Google
      </Button>
    </Box>
  );
}
