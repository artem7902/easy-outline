import React from "react";
import { LoadingButton } from "@mui/lab";
import { Grid, Slide } from "@mui/material";

import { makeStyles } from "tss-react/mui";

interface IArticleSaveButtonProps {
  show: boolean;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

const useStyles = makeStyles()((theme) => ({
  buttonWrapper: {
    width: "100%",
    position: "fixed",
    display: "flex",
    justifyContent: "center",
    zIndex: 2,
    top: theme.spacing(8),
    [theme.breakpoints.down("sm")]: {
      top: theme.spacing(7),
    },
  },
  button: {
    width: "100%",
    zIndex: 1500,
  },
}));

const ArticleSaveButton = ({
  show,
  loading,
  disabled,
  onClick,
}: IArticleSaveButtonProps) => {
  // Styles
  const { classes } = useStyles();

  return (
    <Slide direction="down" in={show} mountOnEnter unmountOnExit>
      <Grid className={classes.buttonWrapper}>
        <LoadingButton
          className={classes.button}
          variant="contained"
          color="primary"
          size="small"
          onClick={onClick}
          loading={loading}
          disabled={disabled}
        >
          Save Changes
        </LoadingButton>
      </Grid>
    </Slide>
  );
};

export default ArticleSaveButton;
