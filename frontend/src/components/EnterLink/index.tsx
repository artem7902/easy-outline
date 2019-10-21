import React from "react";
import { connect } from "react-redux";
import { Button, Input, Form } from "element-react";
import validator from "validator";
import { toast } from "react-toastify";

//models
import { ThunkDispatch } from "redux-thunk";
import { ReduxState, Process, ProcessStatus } from "@models/redux";
import { Article } from "@models/api";

import * as actions from "@redux/actions";

import logo from "../../logo.png";
import "./index.css";

interface EnterLinkProps {
  dispatch: ThunkDispatch<any, any, any>;
  article: Article | undefined;
  addArticleProcess: Process | undefined;
}

class EnterLink extends React.Component<EnterLinkProps> {
  state = {
    form: {
      articleUrl: ""
    },
    rules: {
      articleUrl: [
        {
          message: "Please insert a valid URL",
          trigger: "change",
          validator: (rule: Object, value: string) =>
            !!value && validator.isURL(value)
        }
      ]
    },
    sendingInProcess: false
  };
  form: any = React.createRef();

  onChange(key: string, value: any) {
    this.setState({
      form: Object.assign({}, this.state.form, { [key]: value })
    });
  }
  
  handleSubmit(e: any) {
    e.preventDefault();
    this.form.current.validate((valid: boolean) => {
      if (valid) {
        console.log("submit!");
        this.setState({
          sendingInProcess: true
        });
        this.props.dispatch(
          actions.generateAndAddArticle(this.state.form.articleUrl)
        );
      } else {
        console.log("error submit!!");
        return false;
      }
    });
  }

  componentDidUpdate(prevProps: EnterLinkProps) {
    if (
      !!prevProps.addArticleProcess &&
      prevProps.addArticleProcess.status === ProcessStatus.RUNNING &&
      (!!this.props.addArticleProcess &&
        this.props.addArticleProcess.status === ProcessStatus.FINISHED)
    ) {
      this.setState({
        sendingInProcess: false
      });
      if (!!this.props.addArticleProcess.error) {
        toast(this.props.addArticleProcess.error, {
          type: "error",
          className: "toast-notification"
        });
      } else {
      }
    }
  }

  render() {
    return (
      <div className="enter-link-wrapper">
        <img
          style={{ width: "95vw", maxWidth: "700px" }}
          src={logo}
          alt="logo"
        />
        <Form
          ref={this.form}
          className="en-US"
          model={this.state.form}
          rules={this.state.rules}
        >
          <Form.Item className="article-url-form-item" prop="articleUrl">
            <Input
              className="article-url-input"
              value={this.state.form.articleUrl}
              onChange={this.onChange.bind(this, "articleUrl")}
              placeholder="Instert article URL here"
              autoFocus
            />
          </Form.Item>
        </Form>
        <Button
          className="create-outline-button"
          type="primary"
          size="large"
          onClick={this.handleSubmit.bind(this)}
          loading={this.state.sendingInProcess}
        >
          Create Outline
        </Button>
      </div>
    );
  }
}

export default connect((state: ReduxState) => ({
  article: state.article,
  addArticleProcess: state.processes.find(
    proc => proc.name === actions.actionTypes.ADD_ARTICLE
  )
}))(EnterLink);
