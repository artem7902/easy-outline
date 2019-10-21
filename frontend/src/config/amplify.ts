import Amplify from "aws-amplify";
import * as config from "@config";

Amplify.configure({
  aws_appsync_graphqlEndpoint: config.APPSYNC_URL,
  aws_appsync_region: config.APPSYNC_REGION,
  aws_appsync_authenticationType: "API_KEY",
  aws_appsync_apiKey: config.APPSYNC_API_KEY
});
