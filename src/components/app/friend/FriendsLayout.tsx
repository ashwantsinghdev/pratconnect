import CatchError from "@/lib/CatchError";
import Fetcher from "@/lib/Fetcher";
import HttpInterceptor from "@/lib/HttpInterceptor";
import { Empty } from "@/components/shared/Empty";
import { Skeleton } from "@/components/shared/Skeleton";
import useSWR, { mutate } from "swr";
import { useContext } from "react";
import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import Context from "@/Context";
import { cn } from "@/lib/utils";
import IconButton from "@/components/shared/IconButton";
import getId from "@/lib/getId";

const FriendsLayout = () => {
  const { data, error, isLoading } = useSWR("/friend", Fetcher);
  const { setLiveActiveSession } = useContext(Context);
  const { id: activeId } = useParams();
  const navigate = useNavigate();

  const activeFriend = data?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="flex flex-col lg:flex-row h-full min-h-0 lg:h-[75vh] lg:min-h-125">
      <div
        className={cn(
          "w-full lg:w-96 shrink-0 min-h-0 border-r-0 lg:border-r-2 border-border overflow-y-auto pr-0 lg:pr-2",
          activeId ? "hidden lg:block" : "max-lg:flex-1",
        )}
      >
        {" "}
        {isLoading && <Skeleton active className="p-4" />}
        {error && <Empty className="p-4" />}
        {data && data.length === 0 && <Empty className="p-4" />}
        {data &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                      <div className="relative shrink-0">
                        <img
                          src={item.friend.image || "/public/images/avt.jpeg"}
                          className="rounded-full object-cover h-11 w-11"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h1
                            className={cn(
                              "capitalize font-medium truncate text-sm",
                              isActive ? "text-accent" : "text-foreground",
                            )}
                          >
                            {item.friend.fullname}
                          </h1>
                          {item.lastMessage && (
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {new Date(
                                item.lastMessage.createdAt,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.lastMessage
                            ? item.lastMessage.isAttachment
                              ? item.lastMessage.fileType?.startsWith("image/")
                                ? "📷 Photo"
                                : item.lastMessage.fileType?.startsWith(
                                      "video/",
                                    )
                                  ? "🎥 Video"
                                  : "📎 Attachment"
                              : item.lastMessage.text
                            : "No messages yet"}
                        </p>
                      </div>
                    </Link>

                    <button
                      aria-label="Unfriend"
                      onClick={() => unfriend(item._id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive ml-1"
                    >
                      <i className="ri-user-unfollow-line"></i>
                    </button>
                  </>
                )}
              </div>
            );
          })}
      </div>

      <div
        className={cn(
          "flex-1 min-w-0 min-h-0 pl-0 lg:pl-4 flex-col",
          activeId ? "flex" : "hidden lg:flex",
        )}
      >
        {activeFriend && (
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border px-2 lg:px-0 shrink-0">
            <div className="flex items-center gap-3">
              <button
                aria-label="Back to friends list"
                onClick={() => navigate("/app/friends")}
                className="lg:hidden w-8 h-8 -ml-1 flex items-center justify-center text-foreground"
              >
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
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
              <IconButton
                type="success"
                icon="phone-line"
                onClick={() => {
                  setLiveActiveSession(activeFriend);
                  navigate(`/app/audio-chat/${getId(activeFriend)}`, {
                    state: { autoCall: true },
                  });
                }}
              />
              <IconButton
                type="primary"
                icon="vidicon-line"
                onClick={() => {
                  setLiveActiveSession(activeFriend);
                  navigate(`/app/video-chat/${getId(activeFriend)}`, {
                    state: { autoCall: true },
                  });
                }}
              />
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
