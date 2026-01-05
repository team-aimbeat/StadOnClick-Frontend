import { BrowserRouter } from "react-router-dom"
import { Suspense } from "react"
import AppRoutes from "./routes/AppRoutes"
import "./App.css"
import Signup from "./pages/user-onboarding/SignUp"


function App() {
  return (

      <Suspense fallback={<div>Loading...</div>}>
        <AppRoutes />
      </Suspense>
  )
}

export default App
