import { Process } from "@models/redux";

export const actionTypes = {
  ADD_ARTICLE: "ADD_ARTICLE",
  GET_ARTICLE: "GET_ARTICLE",
  UPSERT_PROCESS: "UPSERT_PROCESS",
};

export const BACK_END_ERROR = `An unexpected error has been occurred.
 Please try again or contact an administrator`;

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
