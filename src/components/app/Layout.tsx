import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import Avatar from "../shared/Avatar";
import { useContext, useEffect, useRef, useState } from "react";
import Dashboard from "./Dashboard";
import Context from "../../Context";
import HttpInterceptor from "../../lib/HttpInterceptor";
import { v4 as uuid } from "uuid";
import useSWR, { mutate } from "swr";
import Fetcher from "../../lib/Fetcher";
import CatchError from "../../lib/CatchError";
import FriendsSuggestion from "./friend/FriendsSuggestion";
import FriendsRequest from "./friend/FriendsRequest";
import { useMediaQuery } from "react-responsive";
import Logo from "../shared/Logo";
import IconButton from "../shared/IconButton";
import FriendsOnline from "./friend/FriendsOnline";
import socket from "../../lib/Socket";
import type { AudioSrcType, onOfferInterface } from "./Video";
import { notification } from "antd";
import { Card } from "../shared/Card";

const EightMinutesInMs = 8 * 60 * 1000;

const ActiveSessionUis = ({
  liveActiveSession,
  navigate,
}: {
  liveActiveSession: any;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  useEffect(() => {
    if (!liveActiveSession) {
      navigate("/app");
    }
  }, [liveActiveSession, navigate]);

  if (!liveActiveSession) return null;

  return (
    <div className="flex gap-3">
      <img
        src={liveActiveSession.image || "/images/avt.avif"}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <h1 className="font-medium capitalize">{liveActiveSession.fullname}</h1>
        <label className="text-xs text-green-400">Online</label>
      </div>
    </div>
  );
};

const Layout = () => {
  const isMobile = useMediaQuery({ query: "max-width:1224px" });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapseSize = isMobile ? 0 : 140;
  const expandedSize = isMobile ? 0 : 350;
  const leftAsideSize = isCollapsed ? collapseSize : expandedSize;
  const { liveActiveSession, setLiveActiveSession, setSdp } =
    useContext(Context);
  const { pathname } = useLocation();
  const params = useParams();
  const paramsArray = Object.keys(params);

  const navigate = useNavigate();
  const audio = useRef<HTMLAudioElement | null>(null);
  const [notify, notifyUi] = notification.useNotification();

  const stopAudio = () => {
    if (!audio.current) return;
    const player = audio.current;
    player.pause();
    player.currentTime = 0;
  };

  const platAudio = (src: AudioSrcType, loop: boolean = false) => {
    stopAudio();
    if (!audio.current) audio.current = new Audio();
    const player = audio.current;
    player.src = src;
    player.loop = loop;
    player.load();
    player.play();
  };

  const logout = async () => {
    try {
      await HttpInterceptor.post("/auth/logout");
      navigate("/login");
    } catch (err) {
      CatchError(err);
    }
  };

  const { error } = useSWR("/auth/refresh-token", Fetcher, {
    refreshInterval: EightMinutesInMs,
    shouldRetryOnError: false,
  });

  const onOffer = (payload: onOfferInterface) => {
    setSdp(payload);
    setLiveActiveSession(payload.from);
    if (payload.type === "video")
      return navigate(`/app/video-chat/${payload.from.socketId}`);
    if (payload.type === "audio")
      return navigate(`/app/audio-chat/${payload.from.socketId}`);
  };

  const startChat = (payload: any) => {
    notify.destroy();
    setLiveActiveSession(payload.from);
    navigate(`/app/chat/${payload.from.id}`);
  };

  const onMessage = (payload: any) => {
    if (location.href.includes("/app/chat")) return;
    platAudio("/public/sound/chat.mp3");
    notify.open({
      message: (
        <h1 className="font-medium capitalize">{payload.from.fullname}</h1>
      ),
      description: payload.message,
      placement: "bottomRight",
      duration: 30,
      actions: [
        <button
          key="chat"
          className="bg-green-400 hover:bg-green-500 text-white rounded px-6 py-2"
          onClick={() => startChat(payload)}
        >
          Start chat
        </button>,
      ],
    });
  };

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  useEffect(() => {
    socket.on("offer", onOffer);
    socket.on("message", onMessage);
    return () => {
      socket.off("offer", onOffer);
      socket.off("message", onMessage);
    };
  }, []);

  const { session, setSession } = useContext(Context);

  const menus = [
    { icon: "ri-home-9-line", href: "/app/dashboard", label: "dashboard" },
    { icon: "ri-chat-smile-3-line", href: "/app/my-posts", label: "my posts" },
    { icon: "ri-group-line", href: "/app/friends", label: "friends" },
  ];

  const sidebarStyle = {
    backgroundColor: "var(--sidebar)",
  };
  const getPathname = (path: string) => {
    const firstPath = path.split("/").pop();
    const finalPath = firstPath?.split("-").join(" ");
    return finalPath;
  };

  const uploadImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.onchange = async () => {
      if (!input.files) return;
      const file = input.files[0];
      const path = `profile-pictures/${uuid()}.png`;
      const payload = { path, type: file.type, status: "public-read" };
      try {
        const options = { headers: { "Content-Type": file.type } };
        const { data } = await HttpInterceptor.post("storage/upload", payload);
        await HttpInterceptor.put(data.url, file, options);
        const { data: user } = await HttpInterceptor.put(
          "/auth/profile-picture",
          { path },
        );
        setSession({ ...session, image: user.image });
        mutate("/auth/refresh-token");
      } catch (err) {
        console.log(err);
      }
    };
  };

  return (
    <div className="min-h-screen">
      <nav className="lg:hidden flex justify-between items-center sticky top-0 z-20000 w-full p-4 bg-linear-to-br from-indigo-900 via-purple-800 to-blue-900">
        <Logo />
        <div className="flex gap-4">
          <IconButton
            onClick={logout}
            icon="logout-circle-line"
            type="success"
          />
          <Link to="/app/friends">
            <IconButton icon="chat-ai-line" type="danger" />
          </Link>
          <IconButton
            onClick={() => setIsCollapsed((prev) => !prev)}
            icon="menu-3-line"
            type="warning"
          />
        </div>
      </nav>

      <aside
        className="bg-sidebar border-r border-sidebar-border fixed top-0 left-0 h-full lg:p-8 overflow-auto z-20000"
        style={{ width: leftAsideSize, transition: "0.2s" }}
      >
        <div
          className="space-y-8 h-full lg:rounded-2xl p-8"
          style={sidebarStyle}
        >
          <div className="flex justify-center">
            {leftAsideSize === collapseSize ? (
              <i className="ri-user-fill text-xl text-sidebar-foreground animate__animated animate__fadeIn"></i>
            ) : (
              <div className="animate__animated animate__fadeIn capitalize">
                {session && (
                  <Avatar
                    title={session.fullname}
                    subtitle={session.email}
                    image={session.image || "/images/images.jpeg"}
                    titleColor="var(--sidebar-foreground)"
                    subtitleColor="var(--muted-foreground)"
                    onClick={uploadImage}
                  />
                )}
              </div>
            )}
          </div>

          <div>
            {menus.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className="flex items-center gap-4 text-sidebar-foreground/60 py-2.5 px-3 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <i className={item.icon} title={item.label}></i>
                <label
                  className={`capitalize ${leftAsideSize === collapseSize ? "hidden" : ""}`}
                >
                  {item.label}
                </label>
              </Link>
            ))}

            <button
              onClick={logout}
              className="flex items-center gap-2 text-sidebar-foreground/60 py-2.5 px-3 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
            >
              <i className="ri-logout-circle-r-line text-xl" title="logout"></i>
              <label className={leftAsideSize === collapseSize ? "hidden" : ""}>
                Logout
              </label>
            </button>
          </div>
        </div>
      </aside>

      <section
        className="lg:py-8 lg:px-1 flex lg:flex-row flex-col gap-8 p-6"
        style={{
          width: isMobile ? "100%" : `calc(100% - ${leftAsideSize}px)`,
          marginLeft: isMobile ? 0 : leftAsideSize,
          transition: "0.2s",
        }}
      >
        <div className="flex-1">
          <Card
            title={
              <div className="flex gap-4 items-center">
                <button
                  className="lg:block hidden bg-muted w-10 h-10 rounded-full hover:bg-muted/70"
                  onClick={() => setIsCollapsed((prev) => !prev)}
                >
                  <i className="ri-arrow-left-line"></i>
                </button>
                <h1>
                  {paramsArray.length === 0 ? (
                    getPathname(pathname)
                  ) : (
                    <ActiveSessionUis
                      liveActiveSession={liveActiveSession}
                      navigate={navigate}
                    />
                  )}
                </h1>
              </div>
            }
            divider
          >
            {pathname === "/app" ? <Dashboard /> : <Outlet />}
          </Card>
        </div>

        <aside className="lg:w-100 lg:pr-6 lg:order-2 order-1 flex flex-col gap-8">
          <FriendsRequest />
          <FriendsSuggestion />
          <FriendsOnline />
        </aside>

        {notifyUi}
      </section>
    </div>
  );
};

export default Layout;
