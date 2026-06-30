import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Layout from "./components/app/Layout";
import Dashboard from "./components/app/Dashboard";
import Posts from "./components/app/Posts";
import Video from "./components/app/Video";
import Audio from "./components/app/Audio";
import Chat from "./components/app/Chat";
import NotFound from "./components/NotFound";
import AuthGuard from "./guards/AuthGuard";
import RedirectGuard from "./guards/RedirectGuard";
import FriendsList from "./components/app/friend/FriendsList";
import Context from "./Context";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "animate.css";
import "font-awesome/css/font-awesome.min.css";
import "remixicon/fonts/remixicon.css";

const App = () => {
  const [session, setSession] = useState(null);
  const [liveActiveSession, setLiveActiveSession] = useState(null);
  const [sdp, setSdp] = useState(null);
  return (
    <Context.Provider
      value={{
        session,
        setSession,
        liveActiveSession,
        setLiveActiveSession,
        sdp,
        setSdp,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* <Route element={<RedirectGuard />}> */}
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          {/* </Route> */}

          {/* <Route element={<AuthGuard />}> */}
            <Route path="/app" element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="my-posts" element={<Posts />} />
              <Route path="friends" element={<FriendsList />} />
              <Route path="video-chat/:id" element={<Video />} />
              <Route path="audio-chat/:id" element={<Audio />} />
              <Route path="chat/:id" element={<Chat />} />
            {/* </Route> */}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </Context.Provider>
  );
};

export default App;
