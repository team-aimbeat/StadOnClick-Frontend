import { PropsWithChildren, useEffect } from "react";
import { useGetMeQuery, useRefreshMutation } from "@/features/auth/api/authApi";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setBootstrapping, setUser } from "@/features/auth/authSlice";
import ScreenLoader from "@/assets/animations/loader";

export function AuthBootstrap({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [refreshSession] = useRefreshMutation();

  const { data, isLoading, isFetching, isSuccess, isError } = useGetMeQuery();

  useEffect(() => {
    dispatch(setBootstrapping(true));
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUser(data?.user ?? null));
      dispatch(setBootstrapping(false));
    }

    if (isError) {
      dispatch(setUser(null));
      dispatch(setBootstrapping(false));
    }
  }, [data?.user, dispatch, isError, isSuccess]);

  useEffect(() => {
    if (!user || typeof window === "undefined") {
      return;
    }

    const intervalId = window.setInterval(() => {
      refreshSession();
    }, 10 * 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshSession, user]);

  if (isLoading || isFetching) {
    return <ScreenLoader />;
  }

  return <>{children}</>;
}
