import { Card, CardContent } from "@/components/shared/Card";
import IconButton from "@/components/shared/IconButton";
import CatchError from "@/lib/CatchError";
import Fetcher from "@/lib/Fetcher";
import HttpInterceptor from "@/lib/HttpInterceptor";
import { Empty } from "@/components/shared/Empty";
import { Skeleton } from "@/components/shared/Skeleton";
import useSWR, { mutate } from "swr";
import { type FC, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Context from "@/Context";

interface FriendsListInterface {
  gap?: number;
  columns?: number;
}

const FriendsList: FC<FriendsListInterface> = () => {
  const { data, error, isLoading } = useSWR("/friend", Fetcher);
  const { setLiveActiveSession } = useContext(Context);
  const navigate = useNavigate();

  const attachmentLabel = (fileType?: string | null) => {
    if (!fileType) return "Attachment";
    if (fileType.startsWith("image/")) return "Photo";
    if (fileType.startsWith("video/")) return "Video";
    return "Document";
  };

  const unfriend = async (id: string) => {
    try {
      await HttpInterceptor.delete(`/friend/${id}`);
      mutate("/friend");
      mutate("/friend/suggestion");
    } catch (err) {
      CatchError(err);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const openChat = (friend: any) => {
  setLiveActiveSession(friend);
  navigate(`/app/friends/${friend._id}`);
};
  if (isLoading) return <Skeleton active />;

  if (error) return <Empty />;

  if (data.length === 0) return <Empty />;

  return (
    <Card>
      <CardContent className="divide-y divide-border">
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.map((item: any) => (
            <div
              key={item._id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <img
                src={item.friend.image || "/public/images/avt.jpeg"}
                className="rounded-full object-cover h-11 w-11 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h1 className="capitalize font-medium truncate">
                  {item.friend.fullname}
                </h1>
                {item.lastMessage && (
                  <p className="text-xs text-muted-foreground truncate">
                    {item.lastMessage.isAttachment
                      ? attachmentLabel(item.lastMessage.fileType)
                      : item.lastMessage.text}
                  </p>
                )}
              </div>

              {item.status === "requested" ? (
                <span className="text-xs text-muted-foreground shrink-0">
                  Pending
                </span>
              ) : (
                <div className="flex gap-2 shrink-0">
                  <IconButton
                    type="primary"
                    icon="chat-3-line"
                    onClick={() => openChat(item.friend)}
                  />
                  <IconButton
                    type="danger"
                    icon="user-minus-line"
                    onClick={() => unfriend(item._id)}
                  />
                </div>
              )}
            </div>
          ))
        }
      </CardContent>
    </Card>
  );
};

export default FriendsList;
