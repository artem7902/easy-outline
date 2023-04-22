import React from "react";
import { Button, Hidden, IconButton } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import EditIcon from "@mui/icons-material/Edit";

import { makeStyles } from "tss-react/mui";

import ArticleDeleteDialog from "./DeleteDialog";
import { ArticleMode } from "./models";

interface IArticleButtonPannelProps {
  articleId: string;
  secretId: string;
  mode: ArticleMode;
  onChangeModeCallback: (mode: ArticleMode) => void;
}

const useStyles = makeStyles()((theme) => ({
  pannelWrapper: {
    display: "flex",
    gap: theme.spacing(1),
    justifyContent: "right",
    marginTop: theme.spacing(2),
  },
}));

const ArticleButtonsPannel = ({
  articleId,
  secretId,
  mode,
  onChangeModeCallback,
}: IArticleButtonPannelProps) => {
  // Styles
  const { classes } = useStyles();

  const onSwitchMode =
    mode === ArticleMode.Edit ? ArticleMode.Outline : ArticleMode.Edit;
  const modeButtonIcon =
    onSwitchMode === ArticleMode.Edit ? <EditIcon /> : <AutoFixHighIcon />;
  const modeButtonLabel = `Switch To ${onSwitchMode} Mode`;
  const renderModeButton = (
    <>
      <Hidden mdUp>
        <IconButton
          color="primary"
          onClick={() => onChangeModeCallback(onSwitchMode)}
        >
          {modeButtonIcon}
        </IconButton>
      </Hidden>
      <Hidden mdDown>
        <Button
          startIcon={modeButtonIcon}
          onClick={() => onChangeModeCallback(onSwitchMode)}
          aria-label={mode}
          variant="contained"
          color="primary"
        >
          {modeButtonLabel}
        </Button>
      </Hidden>
    </>
  );

  const renderDeleteDialog = (
    <ArticleDeleteDialog articleId={articleId} secretId={secretId} />
  );

  return secretId ? (
    <div className={classes.pannelWrapper}>
      {renderDeleteDialog}
      {renderModeButton}
    </div>
  ) : (
    <></>
  );
};

export default ArticleButtonsPannel;
