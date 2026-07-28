/**
 * Typed Redux hooks — the only `useDispatch` / `useSelector` exports
 * the app should use.
 *
 * Typing them with `withTypes` means consumers do not need to pass
 * the `RootState` / `AppDispatch` generics at every call site.
 *
 * Usage:
 *   const dispatch = useAppDispatch();
 *   const user = useAppSelector(state => state.session.user);
 */

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
