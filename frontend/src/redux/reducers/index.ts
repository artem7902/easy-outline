import { Process, ReduxState } from "@models/redux";

export const actionTypes = {
  UPSERT_PROCESS: "UPSERT_PROCESS",
  ADD_ARTICLE: "ADD_ARTICLE",
  GET_ARTICLE: "GET_ARTICLE",
};

const initialState: ReduxState = {
  processes: [] as Process[],
};

export const appReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.ADD_ARTICLE:
      return Object.assign({}, state, {
        article: action.article,
      });
    case actionTypes.UPSERT_PROCESS:
      return Object.assign({}, state, {
        processes: JSON.parse(JSON.stringify(state.processes))
          .filter((proc: any) => proc.name !== action.process.name)
          .concat([action.process]),
      });
    default:
      return state;
  }
};
