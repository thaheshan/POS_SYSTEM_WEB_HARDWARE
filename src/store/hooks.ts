import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";

// Centralized typed hooks prevent repeating generic types in components.

/**
 * Typed version of useDispatch for Redux store.
 * Use this throughout the app to ensure type safety when dispatching actions/thunks.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector for Redux store.
 * Automatically infers state type from RootState.
 */
export const useAppSelector = useSelector.withTypes<RootState>();
