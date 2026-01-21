import { PropsWithChildren, useEffect } from "react";
import { useGetMeQuery } from "@/features/auth/api/authApi";
import { useAppDispatch } from "@/app/hooks";
import { setBootstrapping, setUser } from "@/features/auth/authSlice";
import ScreenLoader from "@/assets/animations/loader";

export function AuthBootstrap({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();

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

  if (isLoading || isFetching) {
    return <ScreenLoader />;
  }

  return <>{children}</>;
}
