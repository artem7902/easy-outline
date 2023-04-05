import React, { useCallback } from "react";

import { AppBar, Toolbar } from "@mui/material";

import { makeStyles } from "tss-react/mui";

import { useNavigate } from "react-router-dom";

const useStyles = makeStyles()((theme) => ({
  container: {
    backgroundColor: "black",
  },
  logo: {
    width: 150,
    cursor: "pointer",
  },
}));

export const Header = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();

  const onLogoClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <AppBar className={classes.container} component="nav">
      <Toolbar>
        <img
          onClick={onLogoClick}
          className={classes.logo}
          src={`${process.env.PUBLIC_URL}/assets/logo-white.png`}
          alt="logo"
        />
      </Toolbar>
    </AppBar>
  );
};
