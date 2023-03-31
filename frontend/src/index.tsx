import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider } from "@mui/material/styles";

import { theme } from "./theme";

import App from "./App";
import { store } from "./redux/store";

import "./index.css";

const root = createRoot(document.getElementById("root") as HTMLElement);

export const muiCache = createCache({
  key: "mui",
  prepend: true,
});

root.render(
  <Provider store={store}>
    <CacheProvider value={muiCache}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </CacheProvider>
  </Provider>
);
