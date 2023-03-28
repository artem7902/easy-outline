import { IArticle } from "../IArticle";

export interface IAddArticleResponse {
  addArticle: {
    id: string;
    secretId: string;
    article: IArticle;
  };
}
