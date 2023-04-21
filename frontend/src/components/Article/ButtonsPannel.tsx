import React from "react";
import { Button, Hidden, IconButton } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import EditIcon from "@mui/icons-material/Edit";

import { makeStyles } from "tss-react/mui";

import { ArticleMode } from "./models";

interface IArticleButtonPannelProps {
  secretId: string;
  mode: ArticleMode;
  changeModeCallback: (mode: ArticleMode) => void;
}

const useStyles = makeStyles()((theme) => ({
  pannelWrapper: {
    display: "flex",
    justifyContent: "right",
    marginTop: theme.spacing(2),
  },
}));

const ArticleButtonsPannel = ({
  secretId,
  mode,
  changeModeCallback,
}: IArticleButtonPannelProps) => {
  // Styles
  const { classes } = useStyles();

  const onSwitchMode =
    mode === ArticleMode.Edit ? ArticleMode.Outline : ArticleMode.Edit;

  const buttonIcon =
    onSwitchMode === ArticleMode.Edit ? <EditIcon /> : <AutoFixHighIcon />;
  const buttonLabel = `Switch To ${onSwitchMode} Mode`;

  return secretId ? (
    <div className={classes.pannelWrapper}>
      <>
        <Hidden mdUp>
          <IconButton
            color="primary"
            onClick={() => changeModeCallback(onSwitchMode)}
          >
            {buttonIcon}
          </IconButton>
        </Hidden>
        <Hidden mdDown>
          <Button
            startIcon={buttonIcon}
            onClick={() => changeModeCallback(onSwitchMode)}
            aria-label={mode}
            variant="contained"
            color="primary"
          >
            {buttonLabel}
          </Button>
        </Hidden>
      </>
    </div>
  ) : (
    <></>
  );
};

export default ArticleButtonsPannel;
