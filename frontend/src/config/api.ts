import { Amplify } from 'aws-amplify';

import { getSharedConfig } from "shared";

export const STAGE = process.env.STAGE ?? "dev";

export const { MAIN_DOMAIN, API_DOMAIN_NAME, DEFAULT_REGION } =
  getSharedConfig(STAGE);

export const APPSYNC_URL = `https://${API_DOMAIN_NAME}/graphql`;
export const APPSYNC_WS_URL = `wss://${API_DOMAIN_NAME}/graphql/realtime`;
export const APPSYNC_REGION = DEFAULT_REGION;
export const APPSYNC_API_KEY = process.env.REACT_APP_APPSYNC_API_KEY ?? "";


Amplify.configure({
  aws_appsync_graphqlEndpoint: APPSYNC_URL,
  aws_appsync_region: APPSYNC_REGION,
  aws_appsync_authenticationType: "API_KEY",
  aws_appsync_apiKey: APPSYNC_API_KEY
});