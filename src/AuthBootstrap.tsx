import { PropsWithChildren, useEffect } from "react"
import { useGetMeQuery } from "@/features/auth/api/authApi"
import { useAppDispatch } from "@/app/hooks"
import { setUser, clearAuth } from "@/features/auth/authSlice"
import ScreenLoader from "@/assets/animations/loader"

export function AuthBootstrap({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch()

  const { data, isLoading, isError } = useGetMeQuery()

  useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data.user))
    }
    if (isError) {
      dispatch(clearAuth())
    }
  }, [data, isError, dispatch])

  if (isLoading) {
    return <ScreenLoader />
  }

  return <>{children}</>
}
