import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "../shared/Avatar";
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

import { cn } from "@/lib/utils";
import { Button } from "../shared/Button";
import { Phone, Video } from "lucide-react";
import socket from "../../lib/Socket";
import getId from "../../lib/getId";
import type { AudioSrcType, onOfferInterface } from "./Video";
import { useNotify } from "../shared/useNotify";
import { Card, CardHeader, CardTitle, CardContent } from "../shared/Card";
import MobileTabBar from "./MobileTabBar";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          <Button
            size="icon"
            variant="secondary"
            aria-label="Start audio call"
            onClick={() => navigate(`/app/audio-chat/${friendId}`)}
          >
            <Phone />
          </Button>
          <Button
            size="icon"
            variant="default"
            aria-label="Start video call"
            onClick={() =>
              navigate(`/app/video-chat/${friendId}`, {
                state: { autoCall: true },
              })
            }
          >
            <Video />
          </Button>
        </div>
      )}
    </div>
  );
};
const Layout = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 1023px)" });
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

  const {
    liveActiveSession,
    setLiveActiveSession,
    setSdp,
    session,
    setSession,
  } = useContext(Context);
  const { pathname } = useLocation();
  const isChatRoute =
    pathname.startsWith("/app/friends") || pathname.startsWith("/app/chat/");
  const params = useParams();
  const paramsArray = Object.keys(params);
  const activeChatFriendIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (pathname.startsWith("/app/friends/") && params.id) {
      activeChatFriendIdRef.current = params.id;
    } else {
      activeChatFriendIdRef.current = undefined;
    }
  }, [pathname, params.id]);

  const hideOuterHeaderOnMobile =
    isMobile && pathname.startsWith("/app/friends/") && !!params.id;

  const navigate = useNavigate();
  const audio = useRef<HTMLAudioElement | null>(null);
  const notify = useNotify();
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
      return navigate(`/app/video-chat/${getId(payload.from)}`);
    if (payload.type === "audio")
      return navigate(`/app/audio-chat/${getId(payload.from)}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const startChat = (payload: any) => {
    notify.destroy();
    setLiveActiveSession(payload.from);
    navigate(`/app/friends/${getId(payload.from)}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMessage = (payload: any) => {
    const senderId = getId(payload.from);
    if (
      activeChatFriendIdRef.current &&
      senderId &&
      activeChatFriendIdRef.current === senderId
    )
      return;
    platAudio("/sound/chat.mp3");
    notify.open({
      message: (
        <h1 className="font-medium capitalize">{payload.from.fullname}</h1>
      ),
      description: payload.message,
      duration: 30,
      actions: [
        <button
          key="chat"
          className="bg-accent hover:opacity-90 text-white rounded-lg px-6 py-2"
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
      const payload = { path, type: file.type, status: "private" };
      try {
        const options = { headers: { "Content-Type": file.type } };
     const { data } = await HttpInterceptor.post("/storage/upload", payload);
     await HttpInterceptor.put(data.url, file, options);
     const { data: download } = await HttpInterceptor.post(
       "/storage/download",
       {
         path,
       },
     );
     const { data: user } = await HttpInterceptor.put("/auth/profile-picture", {
       path: download.url,
     });
     setSession({ ...session, image: user.image });
     mutate("/auth/refresh-token");
       mutate("/auth/refresh-token");
        mutate("/auth/refresh-token");
      } catch (err) {
        console.log(err);
      }
    };
  };

  return (
    <div
      className={cn(
        "min-h-screen",
        isMobile && isChatRoute && "h-dvh flex flex-col overflow-hidden",
      )}
    >
      <nav className="lg:hidden shrink-0 flex justify-between items-center sticky top-0 z-20000 w-full p-4 bg-sidebar border-b border-sidebar-border">
        <button
          aria-label="Open menu"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="w-9 h-9 rounded-lg bg-muted hover:bg-muted/70 text-foreground flex items-center justify-center transition-colors"
        >
          <i className="ri-menu-3-line text-lg"></i>
        </button>

        <Logo />

        <button
          aria-label="Update profile picture"
          onClick={uploadImage}
          className="shrink-0"
        >
          <Avatar className="w-8 h-8 ring-2 ring-border">
            <AvatarImage
              src={session?.image || "/images/images.jpeg"}
              alt={session?.fullname}
            />
            <AvatarFallback>
              {session?.fullname?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </nav>
      {isMobile && isCollapsed && (
        <div
          className="fixed inset-0 bg-foreground/40 z-10000"
          onClick={() => setIsCollapsed(false)}
        />
      )}

      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border fixed top-0 left-0 h-full lg:p-8 overflow-auto z-20000 transition-transform duration-200 ease-in-out",
          "max-lg:w-[85vw] max-lg:max-w-70",
          isMobile && (isCollapsed ? "translate-x-0" : "-translate-x-full"),
        )}
        style={{
          width: isMobile ? undefined : leftAsideSize,
          transition: "0.2s",
        }}
      >
        <div
          className="space-y-8 h-full lg:rounded-2xl p-8 relative"
          style={sidebarStyle}
        >
          {isMobile && (
            <button
              aria-label="Close menu"
              onClick={() => setIsCollapsed(false)}
              className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center z-10"
            >
              <i className="ri-close-line"></i>
            </button>
          )}
          <div className="flex justify-center">
            {leftAsideSize === collapseSize ? (
              <i className="ri-user-fill text-xl text-sidebar-foreground animate__animated animate__fadeIn"></i>
            ) : (
              <div className="animate__animated animate__fadeIn capitalize">
                {session && (
                  <div
                    onClick={uploadImage}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Avatar>
                      <AvatarImage
                        src={session.image || "/images/images.jpeg"}
                        alt={session.fullname}
                      />
                      <AvatarFallback>
                        {session.fullname?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col min-w-0">
                      <h1 className="font-medium capitalize text-sidebar-foreground truncate">
                        {session.fullname}
                      </h1>

                      <p className="text-xs text-muted-foreground truncate">
                        {session.email}
                      </p>
                    </div>
                  </div>
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
        className={cn(
          "lg:py-8 lg:px-1 flex lg:flex-row flex-col gap-8 p-6 pb-24 lg:pb-8",
          isMobile &&
            isChatRoute &&
            "flex-1 min-h-0 overflow-hidden px-0 pt-0 pb-20 gap-0",
        )}
        style={{
          width: isMobile ? "100%" : `calc(100% - ${leftAsideSize}px)`,
          marginLeft: isMobile ? 0 : leftAsideSize,
          transition: "0.2s",
        }}
      >
        <div
          className={cn(
            "flex-1 capitalize",
            isMobile && isChatRoute && "flex flex-col min-h-0",
          )}
        >
          <Card
            className={cn(
              isMobile && "rounded-none border-0 bg-transparent shadow-none",
              isMobile && isChatRoute && "flex-1 min-h-0 flex flex-col",
            )}
          >
            {!hideOuterHeaderOnMobile && (
              <CardHeader
                className={cn(
                  "border-b border-border",
                  isMobile && isChatRoute && "shrink-0",
                )}
              >
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
            )}
            <CardContent
              className={cn(
                isMobile &&
                  isChatRoute &&
                  "flex-1 min-h-0 flex flex-col p-0 overflow-hidden",
              )}
            >
              {pathname === "/app" ? <Dashboard /> : <Outlet />}
            </CardContent>
          </Card>
        </div>
        {!pathname.startsWith("/app/friends") &&
          !pathname.startsWith("/app/chat/") && (
            <aside className="lg:w-100 lg:pr-6 lg:order-2 order-1 flex flex-col gap-8 mb-4 lg:mb-0">
              <FriendRequest />
              <FriendsSuggestion />
              <FriendsOnline />
            </aside>
          )}
      </section>
      <MobileTabBar />
    </div>
  );
};

export default Layout;
