import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/shared/Card";
import Context from "@/Context";
import socket from "@/lib/Socket";
import Fetcher from "@/lib/Fetcher";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";

const FriendsOnline = () => {
  const [onlineUsers, setOnlineUser] = useState([]);
  const { session, setLiveActiveSession } = useContext(Context);
  const navigate = useNavigate();

  
  const { data: friends } = useSWR("/friend", Fetcher);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onlineHandler = (users: any) => {
    setOnlineUser(users);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateActiveSession = (url: string, user: any) => {
    setLiveActiveSession(user);
    navigate(url);
  };

  useEffect(() => {
    socket.on("online", onlineHandler);
    socket.emit("get-online");

    return () => {
      socket.off("online", onlineHandler);
    };
  }, []);

  const isFriend = (userId: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (friends ?? []).some((item: any) => item.friend._id === userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Online friends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {session &&
            onlineUsers
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((item: any) => item.id !== session.id)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((item: any) => isFriend(item.id))
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((item: any, index) => (
                <div key={index} className="flex">
                  <div className="flex gap-3">
                    <img
                      src={item.image || "/public/images/avt.jpeg"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h1 className="font-medium mb-1 capitalize">
                        {item.fullname}
                      </h1>
                      <div className="flex items-center gap-3">
                        <label
                          className={`capitalize-first text-[10px] font-medium text-chart-2`}
                        >
                          Online
                        </label>

                        <button
                          className="cursor-pointer"
                          onClick={() =>
                            generateActiveSession(`/app/chat/${item.id}`, item)
                          }
                        >
                          <i className="ri-chat-ai-line text-accent"></i>
                        </button>

                        <button
                          className="cursor-pointer"
                          onClick={() =>
                            generateActiveSession(
                              `/app/audio-chat/${item.id}`,
                              item,
                            )
                          }
                        >
                          <i className="ri-phone-line text-chart-4"></i>
                        </button>

                        <button
                          className="cursor-pointer"
                          onClick={() =>
                            generateActiveSession(
                              `/app/video-chat/${item.id}`,
                              item,
                            )
                          }
                        >
                          <i className="ri-video-on-ai-line text-chart-2"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendsOnline;
