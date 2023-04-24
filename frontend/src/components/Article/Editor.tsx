import React, { forwardRef, useRef } from "react";

import { CKEditor } from "@ckeditor/ckeditor5-react";
//@ts-ignore
import Editor from "ckeditor5-custom-build/build/ckeditor";

import clsx from "clsx";

import { makeStyles } from "tss-react/mui";

import { ArticleMode } from "./models";

interface IArticleEditiorProps {
  secretId: string;
  mode: ArticleMode;
  html?: string;
  lang?: string;
  onChangeCallback: (html: string) => void;
}

const useStyles = makeStyles()((theme) => ({
  hidden: {
    display: "none",
  },
}));

const ArticleEditor = forwardRef(
  (
    { secretId, mode, html, lang, onChangeCallback }: IArticleEditiorProps,
    forwardedRef: React.ForwardedRef<Editor>
  ) => {
    // Styles
    const { classes } = useStyles();

    // typing timeout Ref for performance optimization
    const typingTimeout = useRef<number | null>(null);

    return (
      <div className={clsx({ [classes.hidden]: mode !== ArticleMode.Edit })}>
        <CKEditor
          config={{
            language: {
              ui: "en",
              content: lang,
            },
          }}
          ref={(ref) => {
            if (forwardedRef) {
              (forwardedRef as any).current = ref?.editor;
            }
          }}
          editor={Editor}
          data={html}
          onChange={(event, editor) => {
            if (typingTimeout.current) {
              window.clearTimeout(typingTimeout.current);
            }
            typingTimeout.current = window.setTimeout(() => {
              const data = editor.data.get();
              onChangeCallback(data);
            }, 300);
          }}
          disabled={!secretId || mode !== ArticleMode.Edit}
        />
      </div>
    );
  }
);

export default ArticleEditor;
