import {
  AppBar,
  Box,
  Button,
  Chip,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import SuiLogo from "../assets/sui-logo-color.svg";
import { useGlobalContext } from "../hooks/useGlobalContext";
import { ResetDialog } from "./../components/ResetDialog";

/**
 * ヘッダーコンポーネント
 * @returns 
 */
export const Header = () => {
  const { signOut } = useGlobalContext();
  const [showResetDialog, setShowResetDialog] = useState(false);

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Stack direction="row" alignItems="center" spacing={2}>
          <img src={SuiLogo} alt="Sui" width={30} height={30} />
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            zkLogin Demo
          </Typography>
          <Chip label="Devnet" color="primary" size="small" />
        </Stack>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="text"
          color="inherit"
          onClick={() => setShowResetDialog(true)}
        >
          Logout
        </Button>
        <ResetDialog
          open={showResetDialog}
          onClose={() => setShowResetDialog(false)}
          onConfirm={() => {
            signOut();
            setShowResetDialog(false);
          }}
        />
      </Toolbar>
    </AppBar>
  );
};
