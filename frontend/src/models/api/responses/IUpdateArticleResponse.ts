import { IArticle } from "../IArticle";

export interface IUpdateArticleResponse {
  updateArticle: {
    id: string;
    secretId: string;
    article: IArticle;
  };
}
