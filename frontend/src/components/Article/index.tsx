import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
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
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import { LoadingButton } from "@mui/lab";
import clsx from "clsx";

import { CKEditor } from "@ckeditor/ckeditor5-react";
//@ts-ignore
import Editor from "ckeditor5-custom-build/build/ckeditor";

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
  hidden: {
    display: "none",
  },
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
  articleButtonsPannel: {
    display: "flex",
    justifyContent: "right",
  },
  articleBody: {
    marginTop: 27, // ToDo cleanup
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  outlinedText: {
    backgroundColor: "white",
    textDecorationLine: "underline",
    textDecorationColor: "red",
    "&[selected]": {
      cursor: "pointer",
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
  const editorRef = useRef<Editor | null>();
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
  const [originalHtml, setOriginalHtml] = useState<string>();

  const [isEditMode, setIsEditMode] = useState<boolean>();

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

  const onMouseUp = useCallback(async () => {
    if (bodyRef.current && markRef.current && window.getSelection) {
      const selection = window.getSelection();
      const deepChildNodes = dom.getDeepChildForNodes(
        bodyRef.current.childNodes
      );
      if (selection) {
        for (const i of _.range(0, selection.rangeCount)) {
          const range = selection.getRangeAt(i);
          const { startOffset, startContainer, endContainer } = range;

          const beforeRangeNodes = deepChildNodes.filter(
            (n) =>
              dom.rangeCompareNode(range, n) === 0 &&
              !n.isSameNode(startContainer)
          );
          const withinRangeNodes = dom.getTextNodesWithinSelectRange(
            bodyRef.current,
            range,
            deepChildNodes
          );

          const marksToRemove = dom.findMarkedNodes([
            startContainer,
            ...withinRangeNodes,
            endContainer,
          ]);
          const markLength = dom.getMarkLengthBySelectRange(
            bodyRef.current,
            range,
            withinRangeNodes
          );

          if (markLength) {
            const startContainerMarkId =
              dom.getMarkNodeAttributes(startContainer);
            const startPosition =
              dom.getNodesTextContentLength(beforeRangeNodes) +
              (!!startContainerMarkId ? 0 : startOffset);
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
                done: async (markedBlocks) => {
                  if (markedBlocks) {
                    selection.removeAllRanges();
                    // remove old marks to prevent overlapping
                    await dom.unmark(markRef.current, marksToRemove);
                    Array.from(marksToRemove).forEach((mark) => {
                      dom.setMarkAsNotSelected(bodyRef.current, mark.id);
                    });
                    setCurrentHtml(bodyRef.current?.innerHTML);
                  }
                },
              }
            );
          }
        }
      }
    }
  }, [classes.outlinedText]);

  const htmlEqual = useCallback((originalHtml: string, currentHtml: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      return (
        editor.data.stringify(editor.data.parse(originalHtml)) ===
        editor.data.stringify(editor.data.parse(currentHtml))
      );
    } else {
      return originalHtml === currentHtml;
    }
  }, []);

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
    if (bodyRef.current && !markRef.current) {
      markRef.current = new Mark(bodyRef.current as any);
    }
    if (bodyRef.current && article) {
      const formattedHtml = dom.formatHtml(article.html);
      setCurrentHtml(formattedHtml);
      setOriginalHtml(formattedHtml);
    }
  }, [article]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.innerHTML = currentHtml || "";
      markRef.current?.setEventListeners({
        onClick: async (markId) => {
          if (secretId) {
            await dom.unmark(markRef.current, [{ id: markId }]);
            setCurrentHtml(bodyRef.current?.innerHTML);
          }
        },
        onMouseOver: (markId) => {
          dom.setMarkAsSelected(bodyRef.current, markId);
        },
        onMouseLeave: (markId) => {
          dom.setMarkAsNotSelected(bodyRef.current, markId);
        },
      });
    }
  }, [currentHtml, secretId]);

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
    if (!originalHtml || !currentHtml) return false;
    // just compare html code strings
    return !htmlEqual(originalHtml, currentHtml);
  }, [originalHtml, currentHtml, htmlEqual]);

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
    const renderArticleButtonsPannel = (
      <div className={classes.articleButtonsPannel}>
        {!isEditMode ? (
          <Button
            startIcon={<EditIcon />}
            onClick={() => setIsEditMode(true)}
            aria-label="edit"
            variant="contained"
            color="primary"
          >
            Switch To Edit Mode
          </Button>
        ) : (
          <Button
            startIcon={<AutoFixHighIcon />}
            onClick={() => setIsEditMode(false)}
            aria-label="outline"
            variant="contained"
            color="primary"
          >
            Switch To Outline Mode
          </Button>
        )}
      </div>
    );
    return (
      <PerfectScrollbar>
        <Container className={classes.articleWrapper} maxWidth="xl">
          {renderTitle}
          {renderSource}
          {secretId && renderArticleButtonsPannel}
          {
            <>
              <div
                ref={bodyRef}
                className={clsx(classes.articleBody, {
                  [classes.hidden]: isEditMode,
                })}
              ></div>
              {secretId && (
                <div className={clsx({ [classes.hidden]: !isEditMode })}>
                  <CKEditor
                    ref={(ref) => {
                      editorRef.current = ref?.editor;
                    }}
                    editor={Editor}
                    data={bodyRef.current?.innerHTML}
                    onChange={(event, editor) => {
                      const data = editor.data.get();
                      setCurrentHtml(data);
                    }}
                    disabled={!secretId || !isEditMode}
                  />
                </div>
              )}
            </>
          }
        </Container>
      </PerfectScrollbar>
    );
  }, [
    renderTitle,
    renderSource,
    bodyRef,
    isEditMode,
    secretId,
    classes.articleBody,
    classes.articleWrapper,
    classes.articleButtonsPannel,
    classes.hidden,
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
