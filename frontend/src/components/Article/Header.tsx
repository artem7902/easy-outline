import React, { useCallback } from "react";

import { AppBar, Toolbar } from "@mui/material";

import { makeStyles } from "tss-react/mui";

import { useNavigate } from "react-router-dom";

import { ReactComponent as LogoWhite } from "@images/logo-white.svg";

const useStyles = makeStyles()((theme) => ({
  container: {
    backgroundColor: "black",
  },
  logo: {
    width: 160,
    height: "auto",
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
        <LogoWhite onClick={onLogoClick} className={classes.logo} />
      </Toolbar>
    </AppBar>
  );
};
