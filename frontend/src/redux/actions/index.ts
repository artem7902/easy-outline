import { API, graphqlOperation } from "aws-amplify";
import { GraphQLResult } from "@aws-amplify/api/lib/types";

import { ProcessStatus, Process } from "@models/redux";
import { Article } from "@models/api";
import store from "@redux/store";
import * as mutations from "@api/mutations";

export const actionTypes = {
  UPSERT_PROCESS: "UPSERT_PROCESS",
  ADD_ARTICLE: "ADD_ARTICLE",
  GET_ARTICLE: "GET_ARTICLE"
};

export const BACK_END_ERROR = `An unexpected error has been occurred.
 Please try again or contact an administrator`;

export const generateAndAddArticle = (url: string) => {
  console.log(url);
  store.dispatch(runProcess(actionTypes.ADD_ARTICLE));
  return function(dispatch: any) {
    return (API.graphql(
      graphqlOperation(mutations.addArticle, { url })
    ) as Promise<GraphQLResult>).then(
      response => {
        console.log("record", JSON.stringify(response.data));
        if (!!!response.errors) {
          dispatch(
            finishProcess(actionTypes.ADD_ARTICLE, undefined, response.data)
          );
        } else {
          console.log("errors", JSON.stringify(response.errors));
          dispatch(finishProcess(actionTypes.ADD_ARTICLE, BACK_END_ERROR));
        }
      },
      error => {
        console.log("errors", JSON.stringify(error));
        dispatch(finishProcess(actionTypes.ADD_ARTICLE, BACK_END_ERROR));
      }
    );
  };
};

export const addArticle = (article: Article) => {
  return {
    type: actionTypes.ADD_ARTICLE,
    article
  };
};

export const runProcess = (name: string) => {
  return {
    type: actionTypes.UPSERT_PROCESS,
    process: { name, status: ProcessStatus.RUNNING }
  };
};

export const finishProcess = (
  name: string,
  error?: string | Object,
  result?: string | Object | Array<any>
) => {
  return {
    type: actionTypes.UPSERT_PROCESS,
    process: { name, status: ProcessStatus.FINISHED, error, result } as Process
  };
};
