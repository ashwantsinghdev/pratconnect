import socket from "@/lib/Socket";
import {
  type FC,
  type ChangeEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../shared/Button";
import Form from "../shared/Form";
import { Input } from "../shared/Input";
import Context from "../../Context";
import { useParams, } from "react-router-dom";
import useSWR from "swr";
import Fetcher from "../../lib/Fetcher";
import CatchError from "../../lib/CatchError";
import { v4 as uuid } from "uuid";
import HttpInterceptor from "../../lib/HttpInterceptor";
import moment from "moment";
import { Paperclip, Send, File as FileIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";

import { Bubble, BubbleContent } from "@/components/shared/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/shared/Message"; 
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/shared/Attachment";
import { Avatar,AvatarFallback,AvatarImage, } from "../shared/Avatar";
interface MessageReceivedInterface {
  from: string;
  message: string;
}

interface AttachmentUiInterface {
  file: {
    path: string;
    key: string;
    type: string;
  };
  filename: string;
  onDownload: () => void;
}
const AttachmentUi: FC<AttachmentUiInterface> = ({
  file,
  filename,
  onDownload,
}) => {
  if (file.type.startsWith("video/"))
    return (
      <div className="relative group/media w-fit">
        <video
          className="rounded-lg max-w-65 max-h-75 object-cover"
          controls
          src={file.path}
        ></video>
        <button
          aria-label="Download"
          onClick={onDownload}
          className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    );

  if (file.type.startsWith("image/"))
    return (
      <div className="relative group/media w-fit">
        <img
          className="rounded-lg max-w-65 max-h-75 object-cover"
          src={file.path}
        />
        <button
          aria-label="Download"
          onClick={onDownload}
          className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    );

  return (
    <Attachment>
      <AttachmentMedia>
        <FileIcon className="h-5 w-5" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{filename}</AttachmentTitle>
        <AttachmentDescription>{file.type}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label="Download" onClick={onDownload}>
          <Download className="h-4 w-4" />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
};

const Chat = () => {
  const chatContainer = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chats, setChats] = useState<any>([]);
  const { session } = useContext(Context);
  const { id } = useParams();

  const { data } = useSWR(id ? `/chat/${id}` : null, id ? Fetcher : null);

  const messageHandler = (messageReceived: MessageReceivedInterface) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setChats((prev: any) => [...prev, messageReceived]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attachmentHandler = (messageReceived: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setChats((prev: any) => [...prev, messageReceived]);
  };

  useEffect(() => {
    socket.on("message", messageHandler);
    socket.on("attachment", attachmentHandler);

    return () => {
      socket.off("message", messageHandler);
      socket.off("attachment", attachmentHandler);
    };
  }, []);

  // setting old chats
  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChats(data);
    }
  }, [data]);

  useEffect(() => {
    const chatDiv = chatContainer.current;
    if (chatDiv) {
      chatDiv.scrollTop = chatDiv.scrollHeight;
    }
  }, [chats]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendMessage = (values: any) => {
    const payload = {
      from: session,
      to: id,
      message: values.message,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setChats((prev: any) => [...prev, payload]);
    socket.emit("message", payload);
  };

  const fileSharing = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const input = e.target;
      if (!input.files) return;
      const file = input.files[0];
      const url = URL.createObjectURL(file);
      const ext = file.name.split(".").pop();
      const filename = `${uuid()}.${ext}`;
      const path = `chats/${filename}`;

      const payload = {
        path,
        type: file.type,
        status: "private",
      };

      const options = {
        headers: {
          "Content-Type": file.type,
        },
      };

      const { data } = await HttpInterceptor.post("/storage/upload", payload);
      await HttpInterceptor.put(data.url, file, options);

      const remoteMetaData = {
        file: {
          path: path,
          type: file.type,
        },
      };

     const localMetaData = {
       file: {
         path: url,
         key: path,
         type: file.type,
       },
     };
      const attachmentPayload = {
        from: session,
        to: id,
        message: filename,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setChats((prev: any) => [
        ...prev,
        { ...attachmentPayload, ...localMetaData },
      ]);

      socket.emit("attachment", { ...attachmentPayload, ...remoteMetaData });
    } catch (err) {
      CatchError(err);
    }
  };

  const download = async (filename: string, path: string) => {
    try {
      const { data } = await HttpInterceptor.post("/storage/download", {
        path,
        filename,
      });
      const a = document.createElement("a");
      a.href = data.url;
      a.download = filename;
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      CatchError(err);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex-1 min-h-0 overflow-y-auto space-y-4 p-3 lg:p-0"
        ref={chatContainer}
      >
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          chats.map((item: any, index: number) => {
            const isMine =
              item.from.id === session.id || item.from._id === session.id;

            return (
              <Message key={index} align={isMine ? "end" : "start"}>
                <MessageAvatar>
                  <Avatar>
                    <AvatarImage
                      src={
                        isMine
                          ? session.image || "/public/images/images.jpeg"
                          : item.from.image || "/public/images/images.jpeg"
                      }
                      alt={isMine ? "You" : item.from.fullname}
                    />
                    <AvatarFallback>
                      {isMine ? "ME" : item.from.fullname?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  {item.file ? (
                    <div
                      className={cn(
                        "space-y-1",
                        isMine ? "self-end" : "self-start",
                      )}
                    >
                      {!isMine && (
                        <h1 className="font-medium capitalize text-sm">
                          {item.from.fullname}
                        </h1>
                      )}
                      <AttachmentUi
                        file={item.file}
                        filename={item.message}
                        onDownload={() => download(item.message, item.file.key)}
                      />
                    </div>
                  ) : (
                    <Bubble variant={isMine ? undefined : "muted"}>
                      <BubbleContent className="space-y-2 min-w-16 max-w-[320px]">
                        {!isMine && (
                          <h1 className="font-medium capitalize text-sm">
                            {item.from.fullname}
                          </h1>
                        )}
                        {item.message}
                      </BubbleContent>
                    </Bubble>
                  )}
                  <MessageFooter>
                    {moment(item.createdAt).format("MMM DD, YYYY hh:mm:ss A")}
                  </MessageFooter>
                </MessageContent>
              </Message>
            );
          })
        }
      </div>

      <div className="p-3">
        <div className="flex gap-4 items-center">
          <Form className="flex gap-4 flex-1" onValue={sendMessage} reset>
            <Input
              name="message"
              placeholder="Type your message"
              className="h-11"
            />
            <Button type="submit" variant="gradient" className="h-11 gap-1.5">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </Form>
          <button className="relative w-11 h-11 bg-accent/10 text-accent rounded-full hover:bg-accent hover:text-white transition-colors flex items-center justify-center shrink-0">
            <Paperclip className="h-5 w-5" />
            <input
              onChange={fileSharing}
              type="file"
              className="opacity-0 w-full h-full absolute top-0 left-0 rounded-full"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;