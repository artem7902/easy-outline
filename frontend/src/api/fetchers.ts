import { GraphQLClient, Variables } from "graphql-request";

import { APPSYNC_API_KEY, APPSYNC_URL } from "@config/api";

const gqlClient = new GraphQLClient(APPSYNC_URL, {
  headers: {
    "x-api-key": APPSYNC_API_KEY,
  },
});

export const gqlFetcher = <T>({
  query,
  input,
}: {
  query: string;
  input?: Variables;
}) => {
  return gqlClient.request<T>(query, input);
};

export const gqlMutator = <T>(query: string, input?: { arg: Variables }) =>
  gqlClient.request<T>(query, input?.arg);
