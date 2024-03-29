import { IArticle } from "../IArticle";

export interface IUpdateArticleResponse {
  updateArticle: {
    id: string;
    article: IArticle;
  };
}
