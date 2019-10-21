import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { appReducer } from "@redux/reducers";
export default createStore(appReducer, applyMiddleware(thunk));
