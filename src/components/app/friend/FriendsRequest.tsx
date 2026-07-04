import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/shared/Card";
import SmallButton from "../../shared/SmallButton";
import Fetcher from "../../../lib/Fetcher";
import useSWR, { mutate } from "swr";
import { Empty, Skeleton } from "antd";
import HttpInterceptor from "../../../lib/HttpInterceptor";
import CatchError from "../../../lib/CatchError";

const FriendRequest = () => {
  const { data, isLoading, error } = useSWR("/friend/request", Fetcher);

  const acceptFriend = async (id: string) => {
    try {
      await HttpInterceptor.put(`/friend/${id}`, { status: "accepted" });
      mutate("/friend/request");
      mutate("/friend");
    } catch (err) {
      CatchError(err);
    }
  };

  if (isLoading) return <Skeleton />;

  if (error) return <Empty />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Swiper slidesPerView={2} spaceBetween={30} className="mySwiper">
          {data.map((item: any, index: number) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col items-center gap-2 border border-border bg-card p-3 rounded-xl">
                <img
                  src="/public/images/avt.jpeg"
                  className="w-20 h-20 rounded-full object-cover"
                  alt=""
                />
                <h1 className="text-base font-medium text-foreground capitalize">
                  {item.user.fullname}
                </h1>
                <SmallButton
                  type="warning"
                  icon="check-double-line"
                  onClick={() => acceptFriend(item._id)}
                >
                  Accept
                </SmallButton>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </CardContent>
    </Card>
  );
};

export default FriendRequest;
