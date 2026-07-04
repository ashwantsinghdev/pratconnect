import { Card } from "@/components/shared/Card";
import Context from "@/Context";
import socket from "@/lib/Socket";
import { useContext,useEffect,useState } from "react";
import {useNavigate} from "react-router-dom"


const FriendsOnline=()=>{
  const [onlineUsers,setOnlineUser]=useState([])
  const {session,setLiveActiveSession}=useContext(Context)
  const navigate=useNavigate()

  const onlineHandler=(users:any)=>{
    setOnlineUser(users)

  }
  
  const generateActiveSession=(url:string,user:any)=>{
    setLiveActiveSession(user)
    navigate(url)
  }

  useEffect(()=>{
    socket.on("online",onlineHandler)
    socket.emit("get-online")

    return()=>{
      socket.off("online",onlineHandler)
    }
  },[])

return (
  <Card title="Online friends">
    <div className="space-y-6">
      {session &&
        onlineUsers
          .filter((item: any) => item.id !== session.id)
          .map((item: any, index) => (
            <div key={index} className="flex">
              <div className="flex gap-3">
                <img
                  src="/public/images/avt.jpeg"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h1 className="font-medium mb-1 capitalize">
                    {item.fullname}
                  </h1>
                  <div className="flex items-center gap-3">
                    <label
                      className={`capitalize-first text-[10px] font-medium text-green-400`}
                    >
                      Online
                    </label>

                    <button
                      className="cursor-pointer"
                      onClick={() =>
                        generateActiveSession(`/app/chat/${item.id}`, item)
                      }
                    >
                      <i className="ri-chat-ai-line text-rose-400"></i>
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
                      <i className="ri-phone-line text-amber-400"></i>
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
                      <i className="ri-video-on-ai-line text-green-400"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
    </div>
  </Card>
);
  
}

export default FriendsOnline

