import { Card, CardContent } from "@/components/shared/Card";
import SmallButton from "@/components/shared/SmallButton";
import CatchError from "@/lib/CatchError";
import Fetcher from "@/lib/Fetcher";
import HttpInterceptor from "@/lib/HttpInterceptor";
import { Empty, Skeleton } from "antd";
import useSWR, { mutate } from "swr";
import { type FC } from "react";

interface FriendsListInterface {
  gap?: number;
  columns?: number;
}

const GAP_CLASSES: Record<number, string> = {
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
};

const COLUMN_CLASSES: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const FriendsList: FC<FriendsListInterface> = ({ gap = 8, columns = 3 }) => {
  const { data, error, isLoading } = useSWR("/friend", Fetcher);

  const unfriend = async (id: string) => {
    try {
      await HttpInterceptor.delete(`/friend/${id}`);
      mutate("/friend");
      mutate("/friend/suggestion");
    } catch (err) {
      CatchError(err);
    }
  };
  if (isLoading) return <Skeleton active  />;

  if (error) return <Empty />;

  if (data.length === 0) return <Empty />;

  return (
    <div
      className={`grid ${COLUMN_CLASSES[columns] ?? COLUMN_CLASSES[3]} ${GAP_CLASSES[gap] ?? GAP_CLASSES[8]}`}
    >
      {data.map((item: any) => (
        <Card key={item._id}>
          <CardContent>
            <div className="flex flex-col items-center gap-3">
              <img
                src={item.friend.image || "/public/images/avt.jpeg"}
                className=" rounded-full object-cover h-20 w-20"
              />
              <h1 className="capitalize">{item.friend.fullname}</h1>
              <div className="relative">
                {item.status === "requested" ? (
                  <SmallButton type="secondary" icon="check-double-line">
                    Friend request sent
                  </SmallButton>
                ) : (
                  <SmallButton
                    type="danger"
                    icon="user-minus-line"
                    onClick={() => unfriend(item._id)}
                  >
                    Unfriend
                  </SmallButton>
                )}

                <div className="w-2 h-2 bg-chart-2 rounded-full absolute -top-1 -right-1 animate__animated animate__pulse animate__infinite"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FriendsList;
