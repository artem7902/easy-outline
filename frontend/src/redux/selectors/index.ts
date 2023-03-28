import { Process, ProcessNames, ReduxState } from "@models/redux";

import { IAddArticleResponse } from "@models/api/responses/IAddArticleResponse";

export const getProcess =
  <T>(processName: string) =>
  (state: ReduxState) =>
    (state.processes.find((p) => p.name === processName) as Process<T>) ?? {
      running: false,
      error: "",
      result: undefined,
    };

export const isProcessRunning = (processName: string) => (state: ReduxState) =>
  !!state.processes.find((p) => p.name === processName)?.running;

export const savingArticleProcess = () =>
  getProcess<IAddArticleResponse>(ProcessNames.SavingArticle);
