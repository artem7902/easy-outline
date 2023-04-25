import { AppDispatch, RootState } from "@redux/store";
import { useSelector, useDispatch, TypedUseSelectorHook } from "react-redux";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { useRecentArticles } from "./use-recent-articles";
