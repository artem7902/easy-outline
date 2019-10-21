import React from "react";
import { connect } from "react-redux";
import { Button, Input, Form } from "element-react";
import { toast } from "react-toastify";

//models
import { ThunkDispatch } from "redux-thunk";
import { ReduxState, Process, ProcessStatus } from "@models/redux";

import * as actions from "@redux/actions";
import "./index.css";

interface ArticleProps {
  dispatch: ThunkDispatch<any, any, any>;
  article: Article | undefined;
  addArticleProcess: Process | undefined;
}

class Article extends React.Component {
  state = {};

  componentDidUpdate(prevProps: ArticleProps) {}

  render() {
    return <div className="article-wrapper"></div>;
  }
}

export default connect((state: ReduxState) => ({}))(Article);
