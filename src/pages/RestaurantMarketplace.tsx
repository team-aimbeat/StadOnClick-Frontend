import { useEffect } from "react"
import { useAppDispatch } from "@/app/hooks"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"
import RestaurantExplorer from "@/components/marketplace/RestaurantExplorer"

export default function RestaurantMarketplace() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle("Restaurants"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <RestaurantExplorer />
    </div>
  )
}
