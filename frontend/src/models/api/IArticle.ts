export interface IArticle {
  title: string;
  originalText: string;
  originalHtml: string;
  html: string;
  authors?: string[];
  publishDate?: string;
  sourceUrl: string;
}
