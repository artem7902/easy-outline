import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Container, Link, Typography } from "@mui/material";
import clsx from "clsx";

import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

import { makeStyles } from "tss-react/mui";

import Mark from "mark.js";

import _ from "lodash";

// @ts-ignore
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@config/constants";

import { IArticle } from "@models/api/IArticle";

import { useArticle, useSaveArticle, useUpdatedArticleSub } from "@api/index";

import { dom } from "@utils";

import { Header } from "./Header";
import ArticleButtonsPannel from "./ButtonsPannel";
import ArticleSaveButton from "./SaveButton";
import ArticleEditor from "./Editor";
import ArticleShare from "./Share";

import { ArticleMode } from "./models";
import ArticleLoading from "./Loading";

const useStyles = makeStyles()((theme) => ({
  hidden: {
    display: "none",
  },
  articleWrapper: {
    height: "auto",
    minHeight: "100%",
    paddingTop: theme.spacing(12),
    paddingBottom: theme.spacing(10),
    [theme.breakpoints.down("lg")]: {
      paddingBottom: theme.spacing(15),
    },
  },
  title: {
    textAlign: "center",
  },
  source: {
    textAlign: "center",
  },
  sourceWrapper: {
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
  articleBody: {
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    "*:first-child": {
      marginTop: 0,
    },
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
}));

const Article = () => {
  // Styles
  const { classes } = useStyles();

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any | null>();
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

  const [mode, setMode] = useState<ArticleMode>(ArticleMode.Outline);

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

  const renderBody = useMemo(() => {
    const renderTitle = article?.title && (
      <Typography className={classes.title} variant={"h6"}>
        {article.title}
      </Typography>
    );
    const renderSource = article?.sourceUrl && (
      <div className={classes.sourceWrapper}>
        <Link
          target="_blank"
          rel="noreferrer"
          className={classes.source}
          href={article.sourceUrl}
        >
          Source
        </Link>
      </div>
    );

    const renderOutlineMode = (
      <div
        ref={bodyRef}
        className={clsx(classes.articleBody, {
          [classes.hidden]: mode !== ArticleMode.Outline,
        })}
      ></div>
    );

    const renderButtonsPannel = articleId && secretId && (
      <ArticleButtonsPannel
        articleId={articleId}
        secretId={secretId}
        mode={mode}
        onChangeModeCallback={setMode}
      />
    );

    const renderArticleEditor = secretId && (
      <ArticleEditor
        ref={editorRef}
        secretId={secretId}
        html={bodyRef.current?.innerHTML}
        mode={mode}
        lang={article?.lang}
        onChangeCallback={setCurrentHtml}
      />
    );

    return (
      <Container className={classes.articleWrapper} maxWidth="xl">
        {renderTitle}
        {renderSource}
        {renderButtonsPannel}
        {renderOutlineMode}
        {renderArticleEditor}
      </Container>
    );
  }, [
    bodyRef,
    mode,
    setMode,
    setCurrentHtml,
    articleId,
    secretId,
    article,
    classes.source,
    classes.title,
    classes.sourceWrapper,
    classes.articleBody,
    classes.articleWrapper,
    classes.hidden,
  ]);

  const renderLoading = <ArticleLoading loading={isGettingArticle} />;

  const renderSaveButton = secretId && (
    <ArticleSaveButton
      show={isArticleChanged}
      disabled={isSavingArticle}
      loading={isSavingArticle}
      onClick={onSaveButtonClick}
    />
  );

  const renderShare = articleId && (
    <ArticleShare articleId={articleId} secretId={secretId} />
  );

  // Main render
  return (
    <>
      <Header />
      {renderLoading}
      {!isGettingArticle && (
        <>
          {renderSaveButton}
          {renderBody}
          {renderShare}
        </>
      )}
    </>
  );
};

export default Article;
