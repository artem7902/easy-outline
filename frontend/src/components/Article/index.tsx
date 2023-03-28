import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, CircularProgress, Divider, Grid, Grow, IconButton, InputAdornment, Link, Slide, TextField, Typography  } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { LoadingButton } from "@mui/lab";
import { API, graphqlOperation } from "aws-amplify";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { GraphQLResult } from "@aws-amplify/api/lib/types";

import { makeStyles } from "tss-react/mui";

import Mark from "mark.js";

import _ from "lodash";

import PerfectScrollbar from 'react-perfect-scrollbar'

import * as queries from "@api/queries";

// @ts-ignore
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@config/constants";

//models
import { IGetPublicArticleResponse } from "@models/api/responses/IGetPublicArticleResponse";

import { IArticle } from "@models/api/IArticle";

import * as mutations from "@api/mutations";

import { IUpdateArticleResponse } from "@models/api/responses/IUpdateArticleResponse";

const useStyles = makeStyles()((theme) => ({
  loadingWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20%"
  },
  articleWrapper: {
    paddingTop: 35,
    height: "calc(100vh - 100px)",
  },
  title: {
    textAlign: "center"
  },
  source: {
    textAlign: "center"
  },
  sourceWrapper: {
    textAlign: "center"
  },
  articleBody: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
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
    zIndex: 1500,
    top: theme.spacing(1)
  },
  saveButton: {
    width: 200,
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
    width: "100%"
  },
  writeUrl: {
    width: "100%"
  }
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

  const [article, setArticle] = useState<IArticle>();

  const [currentHtml, setCurrentHtml] = useState<string>();

  const [isGettingArticle, setIsGettingArticle] = useState<boolean>(true);

  const [isSavingChanges, setIsSavingChanges] = useState<boolean>(false);

  const getArticle = useCallback( async () => {
    try {
      const { data, errors } = await API.graphql(
        graphqlOperation(queries.getPublicArticle, { id: articleId })
      ) as GraphQLResult<IGetPublicArticleResponse>;
      if (!errors && data) {
        setArticle(data.getPublicArticle.article);
      } else {
        toast(ERROR_MESSAGES.BACKEND_ERROR, {
          type: "error",
          className: "toast-notification",
        });
      }
    } catch (error) {
      toast(ERROR_MESSAGES.BACKEND_ERROR, {
        type: "error",
        className: "toast-notification",
      });
    } finally {
      setIsGettingArticle(false);
    }
  }, [articleId]);

  const saveArticle = useCallback( async () => {
    setIsSavingChanges(true);
    try {
      const { data, errors } = await  API.graphql(
        graphqlOperation(mutations.updateArticle, {
          id: articleId,
          secretId,
          html: currentHtml,
        })
      ) as GraphQLResult<IUpdateArticleResponse>;
      if (!errors && data) {
        setArticle(data.updateArticle.article);
        toast(SUCCESS_MESSAGES.ARTICLE_SAVED, {
          type: "success",
          className: "toast-notification",
        });
      } else {
        toast(ERROR_MESSAGES.BACKEND_ERROR, {
          type: "error",
          className: "toast-notification",
        });
      }
    } catch (error) {
      toast(ERROR_MESSAGES.BACKEND_ERROR, {
        type: "error",
        className: "toast-notification",
      });
    } finally {
      setIsSavingChanges(false);
    }
  }, [currentHtml]);

  const onShareUrlButtonClick  = useCallback( (url: string) => {
    toast("The URL copied to clipboard", {
      type: "info",
      className: "toast-notification",
      position: "bottom-center"
    })
    navigator.clipboard.writeText(url);
  
  }, [])

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
      const deepChildNodes = getDeepChildForNodes(childNodes);
      if (selection) {
        _.range(0, selection.rangeCount).forEach((i) => {
          const range = selection.getRangeAt(i);
          const { startOffset, endOffset, startContainer, endContainer } =
            range;
          const beforeContainers = deepChildNodes.filter(
            (n) =>
              rangeCompareNode(range, n) === 0 && !n.isSameNode(startContainer)
          );
          const betweenContainers = deepChildNodes.filter(
            (n) => rangeCompareNode(range, n) === 3
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
          const isOneContainerSelected =
            startContainer.isSameNode(endContainer);

          // Check all nodes for marks
          // console.log("startContainer", startContainer);
          // console.log("startContainer parent", startContainer.parentElement);
          // console.log("betweenContainers", betweenContainers);
          // console.log("endContainer", endContainer);
          // console.log("endContainer parent", endContainer.parentNode);

          const markLength = isOneContainerSelected
            ? endOffset - startOffset
            : (startContainer.textContent?.length ?? 0) -
              startOffset +
              betweenTextLength +
              endOffset;
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
  }, [bodyRef.current, markRef.current]);

  const rangeCompareNode = (range: Range, node: Node) => {
    const nodeRange = node.ownerDocument!.createRange();
    try {
      nodeRange.selectNode(node);
    } catch (e) {
      nodeRange.selectNodeContents(node);
    }
    const nodeIsBefore =
      range.compareBoundaryPoints(Range.START_TO_START, nodeRange) === 1;
    const nodeIsAfter =
      range.compareBoundaryPoints(Range.END_TO_END, nodeRange) === -1;

    if (nodeIsBefore && !nodeIsAfter) return 0;
    if (!nodeIsBefore && nodeIsAfter) return 1;
    if (nodeIsBefore && nodeIsAfter) return 2;

    return 3;
  };

  const getDeepChildForNodes = (childNodes: NodeListOf<ChildNode>) => {
    const child: ChildNode[] = [];
    childNodes.forEach((node) => {
      if (!node.childNodes.length) {
        child.push(node);
      } else {
        child.push(...getDeepChildForNodes(node.childNodes));
      }
    });
    return child;
  };

  const onClick = (markId: number) => {
    if(secretId){
      markRef.current?.unmark({
        element: `#${markId}`,
        done: () => {
          setCurrentHtml(bodyRef.current?.innerHTML);
        },
      });
    }
  };

  useEffect(() => {
    getArticle();
  }, []);

  useEffect(() => {
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
  }, [article, bodyRef.current]);

  useEffect(() => {
    if (secretId && bodyRef.current && article) {
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      if (secretId) {
        window.removeEventListener("mouseup", onMouseUp);
      }
    };
  }, [onMouseUp, secretId]);

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
    return article?.title ? <Typography className={classes.title} variant={"h6"}>{article.title}</Typography> : undefined
  }, [article?.title])

  const renderSource = useMemo(() => {
    return article?.sourceUrl ? <div className={classes.sourceWrapper}> <Link target="_blank" rel="noreferrer" className={classes.source} href={article.sourceUrl}>Source</Link> </div>: undefined
  }, [article?.sourceUrl])

  const renderArticle = useMemo(() => {
    return       <PerfectScrollbar>
    <div className={classes.articleWrapper}>
    {renderTitle}
    {renderSource}
  <div ref={bodyRef} className={classes.articleBody}></div>
  </div>
  </PerfectScrollbar>
  }, [renderTitle, renderSource, bodyRef])
  // Article block render end

  // Share block render start
  const renderReadUrlField = useMemo(() => {
    if(!articleId) return;
    const readUrl = `${window.location.host}/articles/${articleId}`;
    return <TextField
          className={classes.readUrl}
          label="Read URL"
          variant="outlined"
          value={readUrl}
          size="small"
          InputProps={{
            endAdornment: (
                <IconButton onClick={ (e) =>{
                  e.stopPropagation()
                  onShareUrlButtonClick(readUrl)
                } }  size="small">
                  <ContentCopyIcon />
                </IconButton>
            )
          }}
        />
  }
  , [articleId, onShareUrlButtonClick])

  const renderWriteUrlField = useMemo(() => {
    if(!secretId) return;
    const writeUrl = `${window.location.host}/articles/${articleId}/${secretId}`
    return <TextField
        className={classes.writeUrl}
        label="Read/Write URL"
        variant="outlined"
        value={writeUrl}
        size="small"
        InputProps={{
          endAdornment: (
              <IconButton onClick={ (e) =>{
                e.stopPropagation()
                onShareUrlButtonClick(writeUrl)
              } }  size="small">
                <ContentCopyIcon />
              </IconButton>
          )
        }}
      />
  }
, [articleId, secretId, onShareUrlButtonClick])

  const renderSharedBlock = useMemo(() => {
    return <>      <Divider/> <Grid className={classes.shareBlock} container spacing={1}>
    <Grid item xs={6}>
      {renderReadUrlField}
    </Grid>
   { renderWriteUrlField && <Grid item xs={6}>
      {renderWriteUrlField}
  </Grid>}
  </Grid> </> 
  }, [renderReadUrlField, renderWriteUrlField, isGettingArticle])
  // Share block render end

  const renderLoadingBlock = useMemo(() => {
    return isGettingArticle ? <div className={classes.loadingWrapper}><CircularProgress variant="indeterminate" /> </div> : <></>
  }, [isGettingArticle])

  const renderSaveButton = useMemo(() => {
    return     secretId ?    <Slide direction="down" in={isArticleChanged} mountOnEnter unmountOnExit>
    <Grid className={classes.saveButtonWrapper}>
    <LoadingButton
      className={classes.saveButton}
      variant="contained"
      color={"primary"}
      size="small"
      onClick={saveArticle}
      loading={isSavingChanges}
      disabled={isSavingChanges}
    >
      Save Changes
    </LoadingButton>
    </Grid>
  </Slide> : <></>
  }, [secretId, isArticleChanged, isSavingChanges, saveArticle])

  // Main render
  return (
    isGettingArticle ? 
    <> {renderLoadingBlock}</> :
      <>
      {renderSaveButton}
      {renderArticle}
      {renderSharedBlock}
      </>
  );
};

export default Article;
