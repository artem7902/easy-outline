import cdk = require('@aws-cdk/core');

export const STACK_NAME = () => `outline-like-stack-${!!process.env.STAGE ? !!process.env.STAGE : "dev"}`;

export const AWS_REGION = (props?: cdk.StackProps) => !!props && props.env && props.env.region ? props.env.region : "us-east-1";

export const WEBSITE_S3_BUCKET_NAME = (stage?: string) => `outline-like${!!stage && stage!=="prod" ? `-${stage}` : ""}`;
export const ARTICLES_DYNAMODB_TABLE_NAME = (stage?: string) => `outline-like-articles${!!stage && stage!=="prod" ? `-${stage}` : ""}`;
export const APPSYNC_GRAPHQL_API_NAME = (stage?: string) => `outline-like-graphql-api${!!stage && stage!=="prod" ? `-${stage}` : ""}`;
export const APPSYNC_GRAPHQL_DYNAMO_SOURCE_NAME = (stage?: string) => `outline_like_graphql_articles_source${!!stage && stage!=="prod" ? `_${stage}` : ""}`;
export const APPSYNC_GRAPHQL_LAMBDA_SOURCE_NAME = (stage?: string) => `outline_like_graphql_lambda_source${!!stage && stage!=="prod" ? `_${stage}` : ""}`;