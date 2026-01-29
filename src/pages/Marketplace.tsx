import { useEffect } from "react"
import { useAppDispatch } from "@/app/hooks"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"
import ServicesExplorer from "@/components/marketplace/ServicesExplorer"
import RestaurantExplorer from "@/components/marketplace/RestaurantExplorer"

export default function Marketplace() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle("Marketplace"))
  }, [dispatch])

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <ServicesExplorer />
      <RestaurantExplorer />
    </div>
  )
}
