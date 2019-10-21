import gql from "graphql-tag";

export const getPublicArticle = gql`
  query Query {
    getPublicArticle(id: $id) {
      id
      article {
        title
        originalText
        authors
        publishDate
      }
    }
  }
`;
