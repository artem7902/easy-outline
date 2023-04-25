import React, { useCallback, useEffect, useState } from "react";
import { Box, Grid, TextField } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { makeStyles } from "tss-react/mui";
import validator from "validator";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import { ReactComponent as Logo } from "@images/logo.svg";

import { useAddArticle } from "@api";

import RecentArticles from "./RecentArticles";

const VALIDATION_RULES = {
  articleUrl: {
    errorMessage: "Please insert a valid URL",
    validator: (value: string) => !value || validator.isURL(value),
  },
};

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
  },
  logo: {
    width: "95vw",
    height: "auto",
    maxWidth: "700px",
    marginTop: "20vh",
  },
  form: {
    marginTop: theme.spacing(5),
    width: "100vw",
    display: "flex",
    justifyContent: "center",
  },
  formGrid: {
    display: "flex",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  urlInput: {
    width: 500,
    [theme.breakpoints.down("sm")]: {
      width: `calc(100% - ${theme.spacing(4)})`,
    },
  },
  createOutlineButton: {
    marginLeft: theme.spacing(2),
    height: 56,
    [theme.breakpoints.down("md")]: {
      marginTop: theme.spacing(2),
    },
  },
}));

const EnterLink = () => {
  // Styles
  const { classes } = useStyles();

  // Router Navigate
  const navigate = useNavigate();

  // State variables
  const [articleUrl, setArticleUrl] = useState("");
  const [isArticleUrlValid, setIsArticleUrlValid] = useState(true);

  const { addArticle, addArticleResult, isAddingArticle, addArticleError } =
    useAddArticle();

  // Callbacks
  const onUrlFieldChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setArticleUrl(event.target.value);
      setIsArticleUrlValid(
        VALIDATION_RULES.articleUrl.validator(event.target.value)
      );
    }, []);
  const onCreateOutlineClick = useCallback(async () => {
    if (articleUrl && isArticleUrlValid) {
      await addArticle({ url: articleUrl });
    } else {
      return false;
    }
  }, [isArticleUrlValid, articleUrl, addArticle]);

  useEffect(() => {
    if (!isAddingArticle && addArticleError) {
      toast(String(addArticleError), {
        type: "error",
        className: "toast-notification",
      });
    } else if (!isAddingArticle && addArticleResult) {
      navigate(`/articles/${addArticleResult.id}/${addArticleResult.secretId}`);
    }
  }, [isAddingArticle, addArticleResult, addArticleError, navigate]);

  const renderLoadingButton = (
    <Grid item textAlign={"center"} md={6} xs={12}>
      <LoadingButton
        className={classes.createOutlineButton}
        size="large"
        variant="contained"
        onClick={onCreateOutlineClick}
        loading={isAddingArticle}
        disabled={isAddingArticle || !isArticleUrlValid || !articleUrl}
      >
        Create Outline
      </LoadingButton>
    </Grid>
  );

  const renderUrlInput = (
    <Grid item textAlign={"center"} md={6} xs={12}>
      <TextField
        className={classes.urlInput}
        label="Instert article URL here"
        variant="outlined"
        value={articleUrl}
        onChange={onUrlFieldChange}
        autoFocus
        error={!isArticleUrlValid}
        disabled={isAddingArticle}
        helperText={
          !isArticleUrlValid && VALIDATION_RULES.articleUrl.errorMessage
        }
      />
    </Grid>
  );

  return (
    <div className={classes.root}>
      <Logo className={classes.logo} />
      <Box
        className={classes.form}
        component="form"
        noValidate
        autoComplete="off"
      >
        <Grid className={classes.formGrid}>
          {renderUrlInput}
          {renderLoadingButton}
        </Grid>
      </Box>
      <RecentArticles />
    </div>
  );
};

export default EnterLink;
