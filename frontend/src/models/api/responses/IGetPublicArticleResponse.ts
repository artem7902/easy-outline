import { IArticle } from "../IArticle";

export interface IGetPublicArticleResponse {
  getPublicArticle: {
    id: string;
    secretId: string;
    article: IArticle;
  };
}
