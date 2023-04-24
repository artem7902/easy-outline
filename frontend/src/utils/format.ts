export const getArticleReadUrl = (articleId: string) =>
  `${window.location.protocol}//${window.location.host}/articles/${articleId}`;

export const getArticleWriteUrl = (articleId: string, secretId: string) =>
  `${window.location.protocol}//${window.location.host}/articles/${articleId}/${secretId}`;
