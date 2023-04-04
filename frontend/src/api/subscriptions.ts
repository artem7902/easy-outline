import { gql } from "graphql-request";

export const updatedArticleSub = gql`
  subscription Subscription($id: String!) {
    updatedArticle(id: $id) {
      id
      article {
        title
        originalText
        originalHtml
        html
        authors
        publishDate
        sourceUrl
      }
    }
  }
`;
