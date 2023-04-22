import * as React from "react";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import Hidden from "@mui/material/Hidden";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

import { useNavigate } from "react-router-dom";

import { useDeleteArticle } from "@api/index";

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@config/constants";

import constants from "./constants";

interface IArticleDeleteDialogProps {
  articleId: string;
  secretId: string;
}

const ArticleDeleteDialog = ({
  articleId,
  secretId,
}: IArticleDeleteDialogProps) => {
  // Router Navigate
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const {
    deleteArticle,
    deleteArticleError,
    isDeletingArticle,
    deleteArticleResult,
  } = useDeleteArticle();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => !isDeletingArticle && setOpen(false);
  const handleConfirm = () => deleteArticle({ id: articleId, secretId });

  React.useEffect(() => {
    if (!isDeletingArticle && deleteArticleError) {
      toast(ERROR_MESSAGES.BACKEND_ERROR, {
        type: "error",
        className: "toast-notification",
      });
    }
  }, [isDeletingArticle, deleteArticleError]);

  React.useEffect(() => {
    if (deleteArticleResult) {
      toast(SUCCESS_MESSAGES.ARTICLE_DELETED, {
        type: "success",
        className: "toast-notification",
      });
      navigate(`/`);
    }
  }, [navigate, deleteArticleResult]);

  const renderOpenDialogButton = (
    <>
      <Hidden mdUp>
        <IconButton color="error" onClick={handleOpen}>
          <DeleteIcon />
        </IconButton>
      </Hidden>
      <Hidden mdDown>
        <Button
          startIcon={<DeleteIcon />}
          onClick={handleOpen}
          aria-label={"Delete"}
          variant="contained"
          color="error"
        >
          Delete
        </Button>
      </Hidden>
    </>
  );

  return (
    <div>
      {renderOpenDialogButton}
      <Dialog
        open={open}
        fullScreen={fullScreen}
        TransitionComponent={Fade}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{constants.deleteDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {constants.deleteDialog.body}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={isDeletingArticle} onClick={handleClose}>
            {constants.deleteDialog.cancelLabel}
          </Button>
          <LoadingButton
            loading={isDeletingArticle}
            disabled={isDeletingArticle}
            onClick={handleConfirm}
            color="error"
          >
            {constants.deleteDialog.confirmLabel}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ArticleDeleteDialog;
