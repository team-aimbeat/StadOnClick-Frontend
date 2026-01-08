import { RouterProvider } from "react-router-dom"
import { Suspense } from "react"
import appRouter from "./routes/AppRoutes"
import "./App.css"
import { Toaster } from "react-hot-toast"
import ScreenLoader from "@/assets/animations/loader"

function App() {
  return (

    <Suspense fallback={<ScreenLoader />}>
        <RouterProvider router={appRouter} />
        <Toaster position="top-center" />
      </Suspense>
  )
}

export default App
