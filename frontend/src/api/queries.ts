import gql from "graphql-tag";

export const getPublicArticle = gql`
  query Query($id: String!) {
    getPublicArticle(id: $id) {
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
