import { PropsWithChildren, useEffect } from "react";
import { useGetMeQuery } from "@/features/auth/api/authApi";
import { useAppDispatch } from "@/app/hooks";
import { setUser } from "@/features/auth/authSlice";
import ScreenLoader from "@/assets/animations/loader";

export function AuthBootstrap({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();

  const { data, isLoading } = useGetMeQuery();

  useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data.user));
    }
  }, [data, dispatch]);

  if (isLoading) {
    return <ScreenLoader />;
  }

  return <>{children}</>;
}
