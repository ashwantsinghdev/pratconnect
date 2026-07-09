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
import { useMediaQuery } from "react-responsive";
import Logo from "../shared/Logo";
import IconButton from "../shared/IconButton";
import { cn } from "@/lib/utils";

import socket from "../../lib/Socket";
import type { AudioSrcType, onOfferInterface } from "./Video";
import { notification } from "antd";
import { Card, CardHeader, CardTitle, CardContent } from "../shared/Card";

import FriendsSuggestion from "./friend/FriendSuggestion";
import FriendRequest from "./friend/FriendsRequest";
import FriendsOnline from "./friend/FriendsOnline";

const EightMinutesInMs = 8 * 60 * 1000;

const ActiveSessionUis = ({
  liveActiveSession,
  navigate,
  pathname,
  friendId,
}: {
  liveActiveSession: any;
  navigate: ReturnType<typeof useNavigate>;
  pathname: string;
  friendId?: string;
}) => {
  useEffect(() => {
    if (!liveActiveSession) {
      navigate("/app");
    }
  }, [liveActiveSession, navigate]);

  if (!liveActiveSession) return null;

   const showCallIcons = pathname.startsWith("/app/chat/");

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex gap-3">
        <img
          src={liveActiveSession.image || "/images/avt.avif"}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex flex-col justify-center">
          <h1 className="font-medium capitalize">
            {liveActiveSession.fullname}
          </h1>
          <label className="text-xs text-chart-2">Online</label>
        </div>
      </div>
      {showCallIcons && friendId && (
        <div className="flex gap-2">
          <button
            aria-label="Start audio call"
            onClick={() => navigate(`/app/audio-chat/${friendId}`)}
            className="w-9 h-9 rounded-full bg-muted hover:bg-accent hover:text-white text-foreground flex items-center justify-center transition-colors"
          >
            <i className="ri-phone-line"></i>
          </button>
          <button
            aria-label="Start video call"
            onClick={() => navigate(`/app/video-chat/${friendId}`)}
            className="w-9 h-9 rounded-full bg-muted hover:bg-accent hover:text-white text-foreground flex items-center justify-center transition-colors"
          >
            <i className="ri-vidicon-line"></i>
          </button>
        </div>
      )}
    </div>
  );
};
const Layout = () => {
  const isMobile = useMediaQuery({ query: "max-width:1224px" });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapseSize = isMobile ? 0 : 140;
  const expandedSize = isMobile ? 280 : 350;
  const leftAsideSize = isMobile
    ? isCollapsed
      ? expandedSize
      : 0
    : isCollapsed
      ? collapseSize
      : expandedSize;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const startChat = (payload: any) => {
    notify.destroy();
    setLiveActiveSession(payload.from);
    navigate(`/app/chat/${payload.from.id}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <nav className="lg:hidden flex justify-between items-center sticky top-0 z-[20000] w-full p-4 bg-linear-to-br from-indigo-900 via-purple-800 to-blue-900">
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

      {isMobile && isCollapsed && (
        <div
          className="fixed inset-0 bg-foreground/40 z-[10000]"
          onClick={() => setIsCollapsed(false)}
        />
      )}

      <aside
        className="bg-sidebar border-r border-sidebar-border fixed top-0 left-0 h-full lg:p-8 overflow-auto z-[20000]"
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
            {menus.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => isMobile && setIsCollapsed(false)}
                  className={cn(
                    "flex items-center gap-4 py-2.5 px-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-sidebar-foreground/60 hover:bg-accent/5 hover:text-accent",
                  )}
                >
                  <i className={item.icon} title={item.label}></i>
                  <label
                    className={`capitalize ${leftAsideSize === collapseSize ? "hidden" : ""}`}
                  >
                    {item.label}
                  </label>
                </Link>
              );
            })}

            <button
              onClick={logout}
              className="flex items-center gap-2 text-sidebar-foreground/60 py-2.5 px-3 rounded-lg hover:bg-accent/5 hover:text-accent transition-colors w-full"
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
        <div className="flex-1 capitalize">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle>
                <div className="flex gap-4 items-center">
                  <button
                    className="lg:block hidden bg-muted w-10 h-10 rounded-full hover:bg-muted/70"
                    onClick={() => setIsCollapsed((prev) => !prev)}
                  >
                    <i className="ri-arrow-left-line"></i>
                  </button>
                  <h1 className="flex-1">
                    {paramsArray.length === 0 ||
                    pathname.startsWith("/app/friends") ? (
                      getPathname(
                        pathname.startsWith("/app/friends")
                          ? "/app/friends"
                          : pathname,
                      )
                    ) : (
                      <ActiveSessionUis
                        liveActiveSession={liveActiveSession}
                        navigate={navigate}
                        pathname={pathname}
                        friendId={params.id}
                      />
                    )}
                  </h1>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pathname === "/app" ? <Dashboard /> : <Outlet />}
            </CardContent>
          </Card>
        </div>

        {!pathname.startsWith("/app/friends") &&
          !pathname.startsWith("/app/chat/") && (
            <aside className="lg:w-100 lg:pr-6 lg:order-2 order-1 flex flex-col gap-8">
              <FriendRequest />
              <FriendsSuggestion />
              <FriendsOnline />
            </aside>
          )}

        {notifyUi}
      </section>
    </div>
  );
};

export default Layout;
