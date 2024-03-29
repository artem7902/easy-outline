import _ from "lodash";

import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

import { serialize } from "@utils";
import { MAX_RECENT_ARTICLES_NUMBER } from "@config/constants";

interface IRecentArticle {
  id: string;
  secretId?: string;
  title: string;
  visitedAt: number;
}

export const useRecentArticles = () => {
  const [recentArticlesValue, setRecentArticlesValue] = useLocalStorage(
    "recentArticles",
    serialize.serializeMap(new Map<string, IRecentArticle>())
  );

  const recentArticlesMap: Map<string, IRecentArticle> =
    serialize.deserializeMap(recentArticlesValue);
  const recentArticles = _.sortBy(
    Array.from(recentArticlesMap.values()),
    (ra) => ra.visitedAt
  ).reverse();

  const addRecentArticle = useCallback(
    (info: Omit<IRecentArticle, "visitedAt">) => {
      const newOutlinesMap: Map<string, IRecentArticle> =
        serialize.deserializeMap(recentArticlesValue);
      // prevents loosing secret id
      const secretId = info.secretId ?? newOutlinesMap.get(info.id)?.secretId;
      newOutlinesMap.set(info.id, {
        ...info,
        secretId,
        visitedAt: new Date().getTime(),
      });
      if (newOutlinesMap.size > MAX_RECENT_ARTICLES_NUMBER) {
        const keyToDelete = _.minBy(
          Array.from(newOutlinesMap.keys()),
          (key) => newOutlinesMap.get(key)?.visitedAt ?? 0
        );
        if (keyToDelete) {
          newOutlinesMap.delete(keyToDelete);
        }
      }
      setRecentArticlesValue(serialize.serializeMap(newOutlinesMap));
    },
    [recentArticlesValue, setRecentArticlesValue]
  );

  return {
    recentArticles,
    addRecentArticle,
  };
};

export default useRecentArticles;
