import { getSharedConfig } from "shared";

export const STAGE = process.env.STAGE ?? "dev";

export const { MAIN_DOMAIN, API_DOMAIN_NAME, DEFAULT_REGION } =
  getSharedConfig(STAGE);

export const APPSYNC_URL = `https://${API_DOMAIN_NAME}/graphql`;
export const APPSYNC_REGION = DEFAULT_REGION;
export const APPSYNC_API_KEY = process.env.REACT_APP_APPSYNC_API_KEY ?? "";
