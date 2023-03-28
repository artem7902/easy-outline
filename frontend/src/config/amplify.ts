import { Amplify } from "aws-amplify";

export const APPSYNC_URL =
  "https://db7nakkcnnebbfteoyp6g2rqva.appsync-api.us-east-1.amazonaws.com/graphql";

export const APPSYNC_REGION = "us-east-1";
export const APPSYNC_API_KEY = "da2-v55uqcsyovfzvjgi3dwqpsz5uq";


Amplify.configure({
  aws_appsync_graphqlEndpoint: APPSYNC_URL,
  aws_appsync_region: APPSYNC_REGION,
  aws_appsync_authenticationType: "API_KEY",
  aws_appsync_apiKey: APPSYNC_API_KEY,
});
