import React from "react";
import { CircularProgress } from "@mui/material";

import { makeStyles } from "tss-react/mui";

interface IArticleLoadingProps {
  loading: boolean;
}

const useStyles = makeStyles()((theme) => ({
  loadingWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20%",
  },
}));

const ArticleLoading = ({ loading }: IArticleLoadingProps) => {
  // Styles
  const { classes } = useStyles();

  return loading ? (
    <div className={classes.loadingWrapper}>
      <CircularProgress variant="indeterminate" />{" "}
    </div>
  ) : (
    <></>
  );
};

export default ArticleLoading;
