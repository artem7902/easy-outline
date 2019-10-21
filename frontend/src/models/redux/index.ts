import { Article } from "@models/api";

export enum ProcessStatus {
  RUNNING,
  FINISHED
}

export interface Process {
  name: string;
  status: ProcessStatus;
  error?: string | Object;
  result?: string | Object | Array<any>;
}

export interface ReduxState {
  article?: Article;
  processes: Process[];
}
