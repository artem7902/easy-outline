import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import EnterLink from "@components/EnterLink";

//configs
import "@config/amplify";

//css
import "react-toastify/dist/ReactToastify.css";
import "element-theme-default";

const App: React.FC = () => {
  return (
    <Router>
      <ToastContainer />
      <Switch>
        <Route path="*">
          <EnterLink />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
