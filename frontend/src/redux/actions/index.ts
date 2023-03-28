import { API, graphqlOperation } from "aws-amplify";
import { GraphQLResult } from "@aws-amplify/api/lib/types";

import { Process, ProcessNames, ReduxState } from "@models/redux";
import { IArticle } from "@models/api/IArticle";
import * as mutations from "@api/mutations";

import { IAddArticleResponse } from "@models/api/responses/IAddArticleResponse";

export const actionTypes = {
  ADD_ARTICLE: "ADD_ARTICLE",
  GET_ARTICLE: "GET_ARTICLE",
  UPSERT_PROCESS: "UPSERT_PROCESS",
};

export const BACK_END_ERROR = `An unexpected error has been occurred.
 Please try again or contact an administrator`;

export const generateAndAddArticle = (url: string) => {
  return (dispatch: any, getState: () => ReduxState) => {
    dispatch(runProcess(ProcessNames.SavingArticle));
    return (
      API.graphql(graphqlOperation(mutations.addArticle, { url })) as Promise<
        GraphQLResult<IAddArticleResponse>
      >
    ).then(
      (response) => {
        console.log("record", JSON.stringify(response.data?.addArticle));
        if (!!!response.errors && response.data) {
          dispatch(addArticle(response.data.addArticle.article));
          dispatch(
            finishProcess(ProcessNames.SavingArticle, {
              result: response.data,
            })
          );
        } else {
          console.log("errors", JSON.stringify(response.errors));
          dispatch(
            finishProcess(ProcessNames.SavingArticle, { error: BACK_END_ERROR })
          );
        }
      },
      (error) => {
        console.log("errors", JSON.stringify(error));
        dispatch(
          finishProcess(ProcessNames.SavingArticle, { error: BACK_END_ERROR })
        );
      }
    );
  };
};

export const addArticle = (article: IArticle) => {
  return {
    type: actionTypes.ADD_ARTICLE,
    article,
  };
};

export const runProcess = (name: string) => {
  return {
    type: actionTypes.UPSERT_PROCESS,
    process: { name, running: true },
  };
};

export const finishProcess = (
  name: string,
  props: {
    error?: string | Object;
    result?: string | Object | Array<any>;
  }
) => {
  return {
    type: actionTypes.UPSERT_PROCESS,
    process: { name, running: false, ...props } as Process,
  };
};
