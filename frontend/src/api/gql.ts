import { GraphQLClient, Variables } from "graphql-request";

import { API as AmplifyApi, graphqlOperation } from "aws-amplify";

import { GraphQLSubscription } from "@aws-amplify/api";

import { SWRSubscriptionOptions } from "swr/subscription";

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


export const gqlSubscriber = <T>({
  query,
  input,
}: {
  query: string;
  input?: Variables;
}, { next }: SWRSubscriptionOptions<T>) =>{
  const observable =  AmplifyApi.graphql<GraphQLSubscription<T>>(
    graphqlOperation(query, input)
  ).subscribe({
    next: ({ value }) => {
      next(null,  value.data as T)
    },
    error: (error) => next(error),
  });
  return () => observable.unsubscribe();
};