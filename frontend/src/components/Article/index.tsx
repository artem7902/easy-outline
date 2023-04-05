import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Link,
  Slide,
  TextField,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

import { makeStyles } from "tss-react/mui";

import Mark from "mark.js";

import _ from "lodash";

import PerfectScrollbar from "react-perfect-scrollbar";

// @ts-ignore
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@config/constants";

import { IArticle } from "@models/api/IArticle";

import { useArticle, useSaveArticle, useUpdatedArticleSub } from "@api/index";

import { dom } from "@utils";

import { Header } from "./Header";

const useStyles = makeStyles()((theme) => ({
  loadingWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20%",
  },
  articleWrapper: {
    paddingTop: 100,
    height: "calc(100vh - 64px)",
  },
  title: {
    textAlign: "center",
  },
  source: {
    textAlign: "center",
  },
  sourceWrapper: {
    textAlign: "center",
  },
  articleBody: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  outlinedText: {
    backgroundColor: "white",
    textDecorationLine: "underline",
    textDecorationColor: "red",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "rgb(0 90 255 / 15%)",
    },
    "&[selected]": {
      backgroundColor: "rgb(0 90 255 / 15%)",
    },
  },
  saveButtonWrapper: {
    width: "100%",
    position: "fixed",
    display: "flex",
    justifyContent: "center",
    zIndex: 2,
    top: theme.spacing(8),
  },
  saveButton: {
    width: "100%",
    zIndex: 1500,
  },
  shareBlock: {
    display: "flex",
    justifyContent: "center",
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  readUrl: {
    width: "100%",
  },
  writeUrl: {
    width: "100%",
  },
}));

const Article = () => {
  // Styles
  const { classes } = useStyles();

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const markRef = useRef<Mark | null>(null);

  const { articleId, secretId } = useParams<{
    articleId: string;
    secretId?: string;
  }>();

  // API hooks
  const { getArticleResult, isGettingArticle, getArticleError } =
    useArticle(articleId);
  const { saveArticle, saveArticleResult, isSavingArticle, saveArticleError } =
    useSaveArticle();

  const { updatedArticleSubResult } = useUpdatedArticleSub(articleId);

  const [currentHtml, setCurrentHtml] = useState<string>();

  const [article, setArticle] = useState<IArticle>();

  const onSaveButtonClick = useCallback(async () => {
    if (articleId && currentHtml && secretId) {
      await saveArticle({
        id: articleId,
        html: currentHtml,
        secretId,
      });
    }
  }, [currentHtml, articleId, secretId, saveArticle]);

  const onShareUrlButtonClick = useCallback((url: string) => {
    toast("The URL copied to clipboard", {
      type: "info",
      className: "toast-notification",
      position: "bottom-center",
    });
    navigator.clipboard.writeText(url);
  }, []);

  const onMouseUp = useCallback(() => {
    /*
      Different scenarios:
        1. Selected text is fully inside a big mark - ignore and do nothing
        2. Marks bettwen the selected text (full) - remove marks and create a big one
        3. Mark partially inside - remove mark and expand selected range to create a new concated mark
        4. If nothing above - just create a new mark
    */

    if (bodyRef.current && markRef.current && window.getSelection) {
      const selection = window.getSelection();
      const { childNodes } = bodyRef.current;
      const deepChildNodes = dom.getDeepChildForNodes(childNodes);
      if (selection) {
        _.range(0, selection.rangeCount).forEach((i) => {
          const range = selection.getRangeAt(i);
          const { startOffset, endOffset, startContainer, endContainer } =
            range;

          const beforeContainers = deepChildNodes.filter(
            (n) =>
              dom.rangeCompareNode(range, n) === 0 &&
              !n.isSameNode(startContainer)
          );

          const betweenContainers = deepChildNodes.filter(
            (n) =>
              dom.rangeCompareNode(range, n) === 3 &&
              bodyRef.current?.contains(n)
          );
          const startPosition =
            beforeContainers.reduce(
              (acc, n) => (acc += n.textContent?.length ?? 0),
              0
            ) + startOffset;
          const betweenTextLength = betweenContainers.reduce(
            (acc, n) => (acc += n.textContent?.length ?? 0),
            0
          );

          const isStartContainerSelectable =
            bodyRef.current?.contains(startContainer);
          const isEndContainerSelectable =
            bodyRef.current?.contains(endContainer);
          const isOneContainerSelected =
            startContainer.isSameNode(endContainer);

          const getMarkLength = () => {
            if (isOneContainerSelected) {
              // Check if container is a part of article body
              if (!bodyRef.current?.contains(startContainer)) {
                return 0;
              } else {
                return endOffset - startOffset;
              }
            } else {
              const selectInStartContainerLength = isStartContainerSelectable
                ? (startContainer.textContent?.length ?? 0) - startOffset
                : 0;
              const selectInEndContainerLength = isEndContainerSelectable
                ? endOffset
                : 0;
              return (
                selectInStartContainerLength +
                betweenTextLength +
                selectInEndContainerLength
              );
            }
          };

          const markLength = getMarkLength();

          if (!markLength) {
            selection.removeAllRanges();
            return;
          }

          markRef.current?.markRanges(
            [
              {
                start: startPosition,
                length: markLength,
              },
            ],
            {
              element: "mark",
              className: `${classes.outlinedText}`,
              done: (markedBlocks) => {
                if (markedBlocks) {
                  selection.removeAllRanges();
                  setCurrentHtml(bodyRef.current?.innerHTML);
                }
              },
            }
          );
        });
      }
    }
  }, [classes.outlinedText]);

  useEffect(() => {
    if (getArticleError || saveArticleError) {
      toast(ERROR_MESSAGES.BACKEND_ERROR, {
        type: "error",
        className: "toast-notification",
      });
    }
  }, [getArticleError, saveArticleError]);

  useEffect(() => {
    if (!isSavingArticle && saveArticleResult) {
      setArticle(saveArticleResult);
      toast(SUCCESS_MESSAGES.ARTICLE_SAVED, {
        type: "success",
        className: "toast-notification",
      });
    }
  }, [isSavingArticle, saveArticleResult]);

  useEffect(() => {
    if (getArticleResult) {
      setArticle(getArticleResult);
    }
  }, [getArticleResult]);

  useEffect(() => {
    if (updatedArticleSubResult) {
      setArticle(updatedArticleSubResult);
    }
  }, [updatedArticleSubResult]);

  useEffect(() => {
    const onClick = (markId: number) => {
      if (secretId) {
        markRef.current?.unmark({
          element: `#${markId}`,
          done: () => {
            setCurrentHtml(bodyRef.current?.innerHTML);
          },
        });
      }
    };
    if (bodyRef.current && !markRef.current) {
      markRef.current = new Mark(bodyRef.current as any);
    }
    if (bodyRef.current && article) {
      bodyRef.current.innerHTML = article.html;
      setCurrentHtml(bodyRef.current.innerHTML);
      markRef.current?.setEventListeners({
        onClick: onClick,
        onMouseOver: (markId: number) => {
          bodyRef.current?.querySelectorAll(`#${markId}`).forEach((n) => {
            n.setAttribute("selected", "true");
          });
        },
        onMouseLeave: (markId: number) => {
          bodyRef.current
            ?.querySelectorAll(`#${markId}[selected]`)
            .forEach((n) => {
              n.removeAttribute("selected");
            });
        },
      });
    }
  }, [article, secretId]);

  useEffect(() => {
    if (secretId && bodyRef.current && article) {
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      if (secretId) {
        window.removeEventListener("mouseup", onMouseUp);
      }
    };
  }, [onMouseUp, secretId, article]);

  const isArticleChanged = useMemo(() => {
    if (!article?.html || !currentHtml) return false;
    // formats article html code as if it was really inserted to the document
    const fakeDiv = window.document.createElement("div");
    fakeDiv.innerHTML = article.html;
    const originalHtml = fakeDiv.innerHTML;
    // just compare html code strings
    return currentHtml !== originalHtml;
  }, [article?.html, currentHtml]);

  // Article block render start
  const renderTitle = useMemo(() => {
    return article?.title ? (
      <Typography className={classes.title} variant={"h6"}>
        {article.title}
      </Typography>
    ) : undefined;
  }, [article?.title, classes.title]);

  const renderSource = useMemo(() => {
    return article?.sourceUrl ? (
      <div className={classes.sourceWrapper}>
        {" "}
        <Link
          target="_blank"
          rel="noreferrer"
          className={classes.source}
          href={article.sourceUrl}
        >
          Source
        </Link>{" "}
      </div>
    ) : undefined;
  }, [article?.sourceUrl, classes.source, classes.sourceWrapper]);

  const renderArticle = useMemo(() => {
    return (
      <PerfectScrollbar>
        <Container className={classes.articleWrapper} maxWidth="xl">
          {renderTitle}
          {renderSource}
          <div ref={bodyRef} className={classes.articleBody}></div>
        </Container>
      </PerfectScrollbar>
    );
  }, [
    renderTitle,
    renderSource,
    bodyRef,
    classes.articleBody,
    classes.articleWrapper,
  ]);
  // Article block render end

  // Share block render start
  const renderReadUrlField = useMemo(() => {
    if (!articleId) return;
    const readUrl = `${window.location.host}/articles/${articleId}`;
    return (
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
    );
  }, [articleId, onShareUrlButtonClick, classes.readUrl]);

  const renderWriteUrlField = useMemo(() => {
    if (!secretId) return;
    const writeUrl = `${window.location.host}/articles/${articleId}/${secretId}`;
    return (
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
    );
  }, [articleId, secretId, onShareUrlButtonClick, classes.writeUrl]);

  const renderSharedBlock = useMemo(() => {
    if (!article) return <></>;
    return (
      <>
        <Divider />
        <Grid className={classes.shareBlock} container spacing={1}>
          <Grid item xs={6}>
            {renderReadUrlField}
          </Grid>
          {renderWriteUrlField && (
            <Grid item xs={6}>
              {renderWriteUrlField}
            </Grid>
          )}
        </Grid>
      </>
    );
  }, [renderReadUrlField, renderWriteUrlField, article, classes.shareBlock]);
  // Share block render end

  const renderLoadingBlock = useMemo(() => {
    return isGettingArticle ? (
      <div className={classes.loadingWrapper}>
        <CircularProgress variant="indeterminate" />{" "}
      </div>
    ) : (
      <></>
    );
  }, [isGettingArticle, classes.loadingWrapper]);

  const renderSaveButton = useMemo(() => {
    return secretId ? (
      <Slide direction="down" in={isArticleChanged} mountOnEnter unmountOnExit>
        <Grid className={classes.saveButtonWrapper}>
          <LoadingButton
            className={classes.saveButton}
            variant="contained"
            color={"primary"}
            size="small"
            onClick={onSaveButtonClick}
            loading={isSavingArticle}
            disabled={isSavingArticle}
          >
            Save Changes
          </LoadingButton>
        </Grid>
      </Slide>
    ) : (
      <></>
    );
  }, [
    secretId,
    isArticleChanged,
    isSavingArticle,
    onSaveButtonClick,
    classes.saveButton,
    classes.saveButtonWrapper,
  ]);

  // Main render
  return (
    <>
      <Header />
      {isGettingArticle ? (
        <> {renderLoadingBlock}</>
      ) : (
        <>
          {renderSaveButton}
          {renderArticle}
          {renderSharedBlock}
        </>
      )}
    </>
  );
};

export default Article;
