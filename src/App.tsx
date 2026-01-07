import { RouterProvider } from "react-router-dom"
import { Suspense } from "react"
import appRouter from "./routes/AppRoutes"
import "./App.css"
import { Toaster } from "react-hot-toast"


function App() {
  return (

      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={appRouter} />
        <Toaster position="top-center" />
      </Suspense>
  )
}

export default App
