import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import EnterLink from "@components/EnterLink";
import Article from "@components/Article";

//configs
import "@config/amplify";

//css
import "react-toastify/dist/ReactToastify.css";
import 'react-perfect-scrollbar/dist/css/styles.css';

const App: React.FC = () => {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route
          path="/articles/:articleId/:secretId?"
          element={<Article />}
        ></Route>
        <Route path="*" element={<EnterLink />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
