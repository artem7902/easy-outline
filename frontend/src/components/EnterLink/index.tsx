import React, { useCallback, useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { makeStyles } from "tss-react/mui";
import validator from "validator";
import { toast } from "react-toastify";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import * as reduxSelectors from "@redux/selectors";

import * as actions from "@redux/actions";

import { useAppDispatch } from "@hooks";

import logo from "../../logo.png";

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
    maxWidth: "700px",
    marginTop: "20vh",
  },
  form: {
    marginTop: theme.spacing(5),
    width: "100vw",
    display: "flex",
    justifyContent: "center",
  },
  urlInput: {
    width: 500,
  },
  createOutlineButton: {
    marginLeft: theme.spacing(2),
    height: 56
  },
}));

const EnterLink = () => {
  // Styles
  const { classes } = useStyles();

  // Redux dispatch
  const dispatch = useAppDispatch();

  // Router Navigate
  const navigate = useNavigate();

  // State variables
  const [articleUrl, setArticleUrl] = useState("");
  const [isArticleUrlValid, setIsArticleUrlValid] = useState(true);

  // Redux variables
  const {
    running: isSavingArticle,
    error: savingArticleError,
    result: savingArticleResult,
  } = useSelector(reduxSelectors.savingArticleProcess());

  // Callbacks
  const onUrlFieldChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        setArticleUrl(event.target.value);
        setIsArticleUrlValid(
          VALIDATION_RULES.articleUrl.validator(event.target.value)
        );
      },
      [dispatch]
    );
  const onCreateOutlineClick = useCallback(() => {
    if (articleUrl && isArticleUrlValid) {
      dispatch(actions.generateAndAddArticle(articleUrl));
    } else {
      return false;
    }
  }, [dispatch, isArticleUrlValid, articleUrl]);

  useEffect(() => {
    if (!isSavingArticle && savingArticleError) {
      toast(String(savingArticleError), {
        type: "error",
        className: "toast-notification",
      });
    } else if (!isSavingArticle && savingArticleResult) {
      navigate(
        `/articles/${savingArticleResult.addArticle.id}/${savingArticleResult.addArticle.secretId}`
      );
    }
  }, [isSavingArticle, savingArticleResult, savingArticleError]);

  return (
    <div className={classes.root}>
      <img className={classes.logo} src={logo} alt="logo" />
      <Box
        className={classes.form}
        component="form"
        noValidate
        autoComplete="off"
      >
        <TextField
          className={classes.urlInput}
          label="Instert article URL here"
          variant="outlined"
          value={articleUrl}
          onChange={onUrlFieldChange}
          autoFocus
          error={!isArticleUrlValid}
          disabled={isSavingArticle}
          helperText={
            !isArticleUrlValid && VALIDATION_RULES.articleUrl.errorMessage
          }
        />
        <LoadingButton
          className={classes.createOutlineButton}
          size="large"
          variant="contained"
          onClick={onCreateOutlineClick}
          loading={isSavingArticle}
          disabled={isSavingArticle || !isArticleUrlValid || !articleUrl  }
        >
          Create Outline
        </LoadingButton>
      </Box>
    </div>
  );
};

export default EnterLink;
