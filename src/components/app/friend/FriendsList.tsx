import { Card } from "@/components/shared/Card";
import SmallButton from "@/components/shared/SmallButton";
import  CatchError from "@/lib/CatchError";
import Fetcher from "@/lib/Fetcher";
import HttpInterceptor from "@/lib/HttpInterceptor";
import { Empty, Skeleton } from "antd";
import useSWR, { mutate } from "swr";
import { type FC } from "react";


interface FriendsListInterface{
  gap?:number
  columns?:number
}

const FriendsList:FC<FriendsListInterface>=({gap=8,columns=3})=>{
    const { data, error, isLoading } = useSWR("/friend", Fetcher);

    const unfriend=async(id:string)=>{
      try {
        await HttpInterceptor.delete((`/friend/${id}`))
         mutate("/friend");
         mutate("/friend/suggestion");

      } catch (err) {
        CatchError(err)
        
      }
    }
     if (isLoading) return <Skeleton active />;

     if (error) return <Empty />;

     if (data.length === 0) return <Empty />;

return (
  <div className={`grid grid-cols-${columns} gap-${gap}`}>
    {data.map((item: any) => (
      <Card>
        <div className="flex flex-col items-center gap-3">
          <img
            src={item.friend.image || "/public/images/avt.jpeg"}
            className=" rounded-full object-cover h-20 w-20"
          />
          <h1 className="capitalize">{item.friend.fullname}</h1>
          <div className="relative">
            {item.status === "requested" ? (
              <SmallButton icon="check-double-line">
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

            <div className="w-2 h-2 bg-green-400 rounded-full absolute -top-1 -right-1 animate__animated animate__pulse animate__infinite"></div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);


}

export default FriendsList