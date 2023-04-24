import React from "react";
import { Link, Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";

import { useRecentArticles } from "@hooks";

import { format } from "@utils";

const useStyles = makeStyles()((theme) => ({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(4),
  },
  title: {
    textAlign: "center",
    fontWeight: 600,
  },
  articleLink: {
    marginTop: theme.spacing(1.5),
    textAlign: "center",
  },
}));

const RecentArticles = () => {
  // Styles
  const { classes } = useStyles();

  const { recentArticles } = useRecentArticles();

  return recentArticles.length ? (
    <div className={classes.wrapper}>
      <Typography className={classes.title}>
        {`You Recently Visited: `}
      </Typography>
      {recentArticles.map((ra) => (
        <Link
          key={ra.id}
          className={classes.articleLink}
          href={format.getArticleWriteUrl(ra.id, ra.secretId ?? "")}
        >
          {`${ra.title} (${ra.id.slice(-4)})`}
        </Link>
      ))}
    </div>
  ) : (
    <></>
  );
};

export default RecentArticles;
