import { getSharedConfig } from "../shared/config";

export const STAGE = !!process.env.STAGE ? process.env.STAGE : "dev";
export const STACK_PREFIX = `easy-outline-`;
export const STACK_NAME = `${STACK_PREFIX}${STAGE}`;
export const ROOT_HOSTED_ZONE_ID = "Z09060642ZY8PCRUPHOYY";

export default (stage: string) => {
    const {MAIN_DOMAIN, DEFAULT_REGION, WEBSITE_DOMAIN_NAME, API_DOMAIN_NAME} = getSharedConfig(stage)
    const TABLE_NAMES = {
        ARTICLES: `${STACK_PREFIX}articles-${stage}`
    };
    const LAMBDA_NAMES = {
        ADD_ARTICLE: `${STACK_PREFIX}-add-article-${stage}`
    };
    const GRAPH_QL_RESOLVER_TEMPLATE_PATHS = {
        dynamo: {
            [TABLE_NAMES.ARTICLES]: {
                query: {
                    getPublicArticle: `${__dirname}/appsync/resolver-templates-json/get-public-article-request.json`
                },
                mutation: {
                    updateArticle: `${__dirname}/appsync/resolver-templates-json/update-article-request.json`
                }
            }
        },
        lambda: {
            [LAMBDA_NAMES.ADD_ARTICLE]: {
                query: {
    
                },
                mutation: {
                    addArticle: `${__dirname}/appsync/resolver-templates-json/add-article-request.json`
                }
            }
        }
    }
    return {
        WEBSITE_S3_BUCKET_NAME: `${STACK_PREFIX}${stage}`,
        APPSYNC_GRAPHQL_API_NAME: `${STACK_PREFIX}graphql-api-${stage}`,
        WEBSITE_DOMAIN_NAME,
        API_DOMAIN_NAME,
        TABLE_NAMES,
        LAMBDA_NAMES,
        GRAPH_QL_RESOLVER_TEMPLATE_PATHS,
        MAIN_DOMAIN,
        DEFAULT_REGION,
        ROOT_HOSTED_ZONE_ID
    }
}