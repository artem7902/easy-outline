import React, { useCallback, useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { makeStyles } from "tss-react/mui";
import validator from "validator";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import { useAddArticle } from "@api/index";

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
    height: 56,
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

  return (
    <div className={classes.root}>
      <img className={classes.logo} src={`${process.env.PUBLIC_URL}/assets/logo.png`} alt="logo" />
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
          disabled={isAddingArticle}
          helperText={
            !isArticleUrlValid && VALIDATION_RULES.articleUrl.errorMessage
          }
        />
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
      </Box>
    </div>
  );
};

export default EnterLink;
