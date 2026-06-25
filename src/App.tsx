import {BrowserRouter,Routes,Route}from "react-router-dom"
import Home from "./components/Home"
import Login from "./components/Login"
import Signup from "./components/Signup"
import Dashboard from "./components/app/Dashboard"
import "animate.css"
import "font-awesome/css/font-awesome.min.css"
import "remixicon/fonts/remixicon.css"
import NotFound from "./components/NotFound"
import Context from "./Context"
import { useState } from "react"
import {ToastContainer} from "react-toastify"
import Layout from "./components/app/Layout"


const App = () => {
  const [session,setSession]=useState(null)
  const [liveActiveSession,setLiveActiveSession]=useState(null)
  const [sdp,setSdp]=useState(null)
  return (
    <Context.Provider
    value={{session,setSession}}
    >
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="login" element={<Login/>}/>
        <Route path="signup" element={<Signup/>}/>
        <Route path="/app" element={<Layout/>}>
        <Route path="dashboard" element={<Dashboard/>}/>
        </Route>
        <Route path="*" element={<NotFound/>}/>


      </Routes>
      <ToastContainer/>
      </BrowserRouter>
    </Context.Provider>
  )
}

export default App