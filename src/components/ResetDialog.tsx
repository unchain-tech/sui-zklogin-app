import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface ResetDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetDialog({ open, onClose, onConfirm }: ResetDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Please confirm if you want to reset the local state?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Resetting the local state{" "}
          <span
            style={{
              fontWeight: 600,
            }}
          >
            will clear the Salt value
          </span>{" "}
          stored in local storage, rendering previously generated addresses
          irretrievable.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
