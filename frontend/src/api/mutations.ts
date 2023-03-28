import gql from "graphql-tag";
export const addArticle = gql`
  mutation Mutation($url: String!) {
    addArticle(url: $url) {
      id
      secretId
      article {
        title
        originalText
        originalHtml
        html
        authors
        publishDate
      }
    }
  }
`;

export const updateArticle = gql`
  mutation Mutation($id: String!, $secretId: String!, $html: String!) {
    updateArticle(id: $id, secretId: $secretId, html: $html) {
      id
      secretId
      article {
        title
        originalText
        originalHtml
        html
        authors
        publishDate
      }
    }
  }
`;
