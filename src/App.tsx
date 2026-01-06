import { RouterProvider } from "react-router-dom"
import { Suspense } from "react"
import appRouter from "./routes/AppRoutes"
import "./App.css"


function App() {
  return (

      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={appRouter} />
      </Suspense>
  )
}

export default App
