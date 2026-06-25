import {BrowserRouter,Routes,Route}from "react-router-dom"
import Home from "./components/Home"
import Login from "./components/Login"
import Signup from "./components/Signup"
import "animate.css"
import "font-awesome/css/font-awesome.min.css"
import "remixicon/fonts/remixicon.css"
import NotFound from "./components/NotFound"
import Context from "./Context"
import { useState } from "react"


const App = () => {
  const [session,setSession]=useState(null)
  return (
    <Context.Provider
    value={{session,setSession}}
    >
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="login" element={<Login/>}/>
        <Route path="signup" element={<Signup/>}/>
        <Route path="*" element={<NotFound/>}/>

      </Routes>
      </BrowserRouter>
    </Context.Provider>
  )
}

export default App