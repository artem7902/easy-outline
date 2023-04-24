import React from "react";
import { Container, Divider, Grid, IconButton, TextField } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { toast } from "react-toastify";

import { makeStyles } from "tss-react/mui";

import { format } from "@utils";

interface IArticleShareProps {
  articleId: string;
  secretId?: string;
}

const useStyles = makeStyles()((theme) => ({
  hidden: {
    display: "none",
  },
  blockWrapper: {
    width: "100%",
    position: "fixed",
    bottom: 0,
    paddingBottom: theme.spacing(1),
    zIndex: 1000,
    backgroundColor: "white",
  },
  blockGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  readUrlGridItem: {
    "&:only-child": {
      maxWidth: `${theme.breakpoints.values.xl}px !important`,
    },
  },
  writeUrlGridItem: {
    [theme.breakpoints.down("lg")]: {
      paddingTop: `${theme.spacing(2)} !important`,
    },
  },
  readUrl: {
    width: "100%",
  },
  writeUrl: {
    width: "100%",
  },
}));

const ArticleShare = ({ articleId, secretId }: IArticleShareProps) => {
  // Styles
  const { classes } = useStyles();
  const readUrl = format.getArticleReadUrl(articleId);
  const writeUrl = secretId && format.getArticleWriteUrl(articleId, secretId);

  const onShareUrlButtonClick = (url: string) => {
    toast("The URL copied to clipboard", {
      type: "info",
      className: "toast-notification",
      position: "bottom-center",
    });
    navigator.clipboard.writeText(url);
  };

  const renderWriteUrlField = writeUrl && (
    <Grid item className={classes.writeUrlGridItem} lg={6} xs={12}>
      <TextField
        className={classes.writeUrl}
        label="Read/Write URL"
        variant="outlined"
        value={writeUrl}
        size="small"
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onShareUrlButtonClick(writeUrl);
              }}
              size="small"
            >
              <ContentCopyIcon />
            </IconButton>
          ),
        }}
      />
    </Grid>
  );

  const renderReadUrlField = readUrl && (
    <Grid
      item
      className={classes.readUrlGridItem}
      lg={renderWriteUrlField ? 6 : 12}
      xs={12}
    >
      <TextField
        className={classes.readUrl}
        label="Read URL"
        variant="outlined"
        value={readUrl}
        size="small"
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onShareUrlButtonClick(readUrl);
              }}
              size="small"
            >
              <ContentCopyIcon />
            </IconButton>
          ),
        }}
      />
    </Grid>
  );

  return (
    <Container disableGutters maxWidth={false} className={classes.blockWrapper}>
      <Divider />
      <Grid className={classes.blockGrid} container spacing={1}>
        {renderReadUrlField}
        {renderWriteUrlField}
      </Grid>
    </Container>
  );
};

export default ArticleShare;
