import { IArticle } from "@models/api/IArticle";

export enum ProcessNames {
  SavingArticle = "SavingArticle",
}

export interface Process<R = any> {
  name: ProcessNames;
  running: boolean;
  error?: string | Object;
  result?: R;
}

export interface ReduxState {
  article?: IArticle;
  processes: Process[];
}
