import { IArticle } from "../IArticle";

export interface IUpdatedArticleSubResponse {
  updatedArticle: {
    id: string;
    article: IArticle;
  };
}
