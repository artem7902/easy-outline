import React, { createContext } from "react";

import { useRecentArticles } from "@hooks";

export const RecentArticlesContext = createContext<
  ReturnType<typeof useRecentArticles>
>({
  recentArticles: [],
  addRecentArticle: () => {},
  deleteRecentArticle: () => {},
});

export const RecentArticlesProvider = ({ children }: any) => {
  const recentArticles = useRecentArticles();
  return (
    <RecentArticlesContext.Provider value={recentArticles}>
      {children}
    </RecentArticlesContext.Provider>
  );
};
