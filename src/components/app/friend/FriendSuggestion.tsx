import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import SmallButton from "../../shared/SmallButton";
import useSWR, { mutate } from "swr";
import Fetcher from "../../../lib/Fetcher";
import { Empty, Skeleton } from "antd";
import CatchError from "../../../lib/CatchError";
import HttpInterceptor from "../../../lib/HttpInterceptor";
import { toast } from "react-toastify";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/shared/Card";

const FriendsSuggestion = () => {
  const { data, error, isLoading } = useSWR("/friend/suggestion", Fetcher);
  if (isLoading) return <Skeleton active />;

  if (error) return <Empty />;

  const sendFriendRequest = async (id: string) => {
    try {
      await HttpInterceptor.post("/friend", { friend: id });
      mutate("/friend/suggestion");
      mutate("/friend");

      toast.success("Friend request sent", { position: "top-center" });
    } catch (err) {
      CatchError(err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggestion</CardTitle>
      </CardHeader>
      <CardContent>
        <Swiper slidesPerView={2} spaceBetween={30} className="mySwiper">
          {data.map((item: any, index: number) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col items-center gap-2 border border-border bg-card p-3 rounded-xl">
                <img
                  src={item.image || "/public/images/avt.jpeg"}
                  className="w-20 h-20 rounded-full object-cover"
                  alt=""
                />
                <h1 className="text-base font-medium text-foreground">
                  {item.fullname}
                </h1>
                <SmallButton
                  type="primary"
                  icon="user-add-line"
                  onClick={() => sendFriendRequest(item._id)}
                >
                  Add Friend
                </SmallButton>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </CardContent>
    </Card>
  );
};

export default FriendsSuggestion;
