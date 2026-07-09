import CatchError from "@/lib/CatchError";
import Fetcher from "@/lib/Fetcher";
import HttpInterceptor from "@/lib/HttpInterceptor";
import { Empty, Skeleton } from "antd";
import useSWR, { mutate } from "swr";
import { useContext } from "react";
import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import Context from "@/Context";
import { cn } from "@/lib/utils";

const FriendsLayout = () => {
  const { data, error, isLoading } = useSWR("/friend", Fetcher);
  const { setLiveActiveSession } = useContext(Context);
  const { id: activeId } = useParams();
  const navigate = useNavigate();

  const activeFriend = data?.find(
    (item: any) => item.friend._id === activeId,
  )?.friend;

  const unfriend = async (id: string) => {
    try {
      await HttpInterceptor.delete(`/friend/${id}`);
      mutate("/friend");
      mutate("/friend/suggestion");
    } catch (err) {
      CatchError(err);
    }
  };

  return (
    <div className="flex h-[75vh] min-h-[500px]">
      <div className="w-96 shrink-0 border-r-2 border-border overflow-y-auto pr-2">
        {isLoading && <Skeleton active className="p-4" />}
        {error && <Empty className="p-4" />}
        {data && data.length === 0 && <Empty className="p-4" />}

        {data &&
          data.map((item: any) => {
            const isActive = activeId === item.friend._id;
            return (
              <div
                key={item._id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 border-b border-border",
                  isActive && "bg-accent/10",
                )}
              >
                {item.status === "requested" ? (
                  <>
                    <img
                      src={item.friend.image || "/public/images/avt.jpeg"}
                      className="rounded-full object-cover h-10 w-10 shrink-0"
                    />
                    <h1 className="capitalize font-medium flex-1 truncate text-sm">
                      {item.friend.fullname}
                    </h1>
                    <span className="text-xs text-muted-foreground shrink-0">
                      Pending
                    </span>
                  </>
                ) : (
                  <>
                    <Link
                      to={item.friend._id}
                      onClick={() => setLiveActiveSession(item.friend)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <img
                        src={item.friend.image || "/public/images/avt.jpeg"}
                        className="rounded-full object-cover h-10 w-10 shrink-0"
                      />
                      <h1
                        className={cn(
                          "capitalize font-medium flex-1 truncate text-sm",
                          isActive ? "text-accent" : "text-foreground",
                        )}
                      >
                        {item.friend.fullname}
                      </h1>
                    </Link>
                    <button
                      aria-label="Unfriend"
                      onClick={() => unfriend(item._id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <i className="ri-user-unfollow-line"></i>
                    </button>
                  </>
                )}
              </div>
            );
          })}
      </div>

      <div className="flex-1 min-w-0 pl-4 flex flex-col">
        {activeFriend && (
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <img
                src={activeFriend.image || "/public/images/avt.jpeg"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h1 className="font-medium capitalize text-sm">
                  {activeFriend.fullname}
                </h1>
                <label className="text-xs text-chart-2">Online</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                aria-label="Start audio call"
                onClick={() => navigate(`/app/audio-chat/${activeFriend._id}`)}
                className="w-9 h-9 rounded-full bg-muted hover:bg-accent hover:text-white text-foreground flex items-center justify-center transition-colors"
              >
                <i className="ri-phone-line"></i>
              </button>
              <button
                aria-label="Start video call"
                onClick={() => navigate(`/app/video-chat/${activeFriend._id}`)}
                className="w-9 h-9 rounded-full bg-muted hover:bg-accent hover:text-white text-foreground flex items-center justify-center transition-colors"
              >
                <i className="ri-vidicon-line"></i>
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FriendsLayout;
