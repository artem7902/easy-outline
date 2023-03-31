import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import * as gqlQueries from "./queries";
import * as gqlMutations from "./mutations";
import { gqlFetcher, gqlMutator } from "./fetchers";

import { IGetPublicArticleResponse } from "@models/api/responses/IGetPublicArticleResponse";
import { IUpdateArticleResponse } from "@models/api/responses/IUpdateArticleResponse";
import { IAddArticleResponse } from "@models/api/responses/IAddArticleResponse";

export const useArticle = (articleId?: string) => {
  const {
    data,
    error,
    isLoading: isGettingArticle,
  } = useSWR<IGetPublicArticleResponse>(
    () =>
      articleId
        ? { query: gqlQueries.getPublicArticle, input: { id: articleId } }
        : null,
    gqlFetcher
  );
  const getArticleResult = data?.getPublicArticle?.article;
  const getArticleError = getArticleResult ? error : !isGettingArticle;
  return {
    getArticleResult,
    getArticleError,
    isGettingArticle,
  };
};

export const useSaveArticle = () => {
  const {
    trigger: saveArticle,
    data,
    isMutating: isSavingArticle,
    error: saveArticleError,
  } = useSWRMutation<
    IUpdateArticleResponse,
    any,
    any,
    { id: string; secretId: string; html: string }
  >(gqlMutations.updateArticle, gqlMutator);
  return {
    saveArticle,
    isSavingArticle,
    saveArticleResult: data?.updateArticle.article,
    saveArticleError,
  };
};

export const useAddArticle = () => {
  const {
    trigger: addArticle,
    data,
    isMutating: isAddingArticle,
    error: addArticleError,
  } = useSWRMutation<IAddArticleResponse, any, any, { url: string }>(
    gqlMutations.addArticle,
    gqlMutator
  );
  return {
    addArticle,
    isAddingArticle,
    addArticleResult: data?.addArticle,
    addArticleError,
  };
};
