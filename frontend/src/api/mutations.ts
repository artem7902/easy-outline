import gql from "graphql-tag";
export const addArticle = gql`
  mutation Mutation($url: String!) {
    addArticle(url: $url) {
      id
      secretId
      article {
        title
        originalText
        authors
        publishDate
      }
    }
  }
`;

/*export const updateArticle  = (id: string, secretId: string) => `
     mutation Mutation {
        updateArticle(url: "${url}") 
           {
             id
             secretId
             article{
                title 
                originalText
                authors
                publishDate
             }
           }
        }
`

updateArticle(id: String!, secretId: String!, article: ArticleInput!)
*/
