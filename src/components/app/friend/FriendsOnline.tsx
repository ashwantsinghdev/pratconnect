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
import IconButton from "@/components/shared/IconButton";

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
  const generateActiveSession = (url: string, user: any, autoCall = false) => {
    setLiveActiveSession(user);
    navigate(url, autoCall ? { state: { autoCall: true } } : undefined);
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
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 cursor-pointer"
                  onClick={() =>
                    generateActiveSession(`/app/friends/${item.id}`, item)
                  }
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || "/public/images/avt.jpeg"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h1 className="font-medium capitalize">
                        {item.fullname}
                      </h1>
                      <label className="text-[10px] font-medium text-chart-2">
                        Online
                      </label>
                    </div>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      type="primary"
                      icon="chat-ai-line"
                      onClick={() =>
                        generateActiveSession(`/app/friends/${item.id}`, item)
                      }
                    />
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendsOnline;
