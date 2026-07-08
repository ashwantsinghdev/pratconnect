const env = import.meta.env;
import { useState } from "react";
import { Button } from "../shared/Button";
import { Card, CardContent } from "../shared/Card";
import Divider from "../shared/Divider";
import Editor from "../shared/Editor";

import { v4 as uuid } from "uuid";
import { Heart, ThumbsDown, MessageCircle } from "lucide-react";

import { message, Skeleton } from "antd";

import CatchError from "../../lib/CatchError";
import HttpInterceptor from "../../lib/HttpInterceptor";
import moment from "moment";
import useSWR, { mutate } from "swr";
import Fetcher from "../../lib/Fetcher";

interface FileDataInterface {
  url: string;
  file: File;
}

const Posts = () => {
  const { data, error, isLoading } = useSWR("/post", Fetcher);

  const [value, setValue] = useState("");
  const [fileData, setFileData] = useState<FileDataInterface | null>(null);

  const attachFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.click();

    input.onchange = () => {
      if (!input.files) return;
      const file = input.files[0];
      input.remove();
      const url = URL.createObjectURL(file);
      setFileData({ url, file: file });
    };
  };

  const createPost = async () => {
    try {
      let path = null;
      if (fileData) {
        const ext = fileData.file.name.split(".").pop();
        const filename = `${uuid()}.${ext}`;
        path = `posts/${filename}`;

        const payload = {
          path: path,
          status: "public-read",
          type: fileData.file.type,
        };

        const options = {
          headers: {
            "Content-Type": fileData.file.type,
          },
        };

        const { data } = await HttpInterceptor.post("/storage/upload", payload);
        await HttpInterceptor.put(data.url, fileData.file, options);
      }

      const formData = {
        attachment: path,
        type: path ? fileData?.file.type : null,
        content: value,
      };
      await HttpInterceptor.post("/post", formData);
      mutate("/post");
      message.success("Post created successfully");
      setFileData(null);
      setValue("");
    } catch (err) {
      CatchError(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-8">
        {value.length === 0 && (
          <h1 className="text-lg font-medium ">Write your post here</h1>
        )}
        <Card>
          <CardContent className="space-y-8">
            {fileData && fileData.file.type.startsWith("image/") && (
              <img
                src={fileData.url}
                className="rounded-lg object-cover w-full max-h-[500px]"
              />
            )}
            {fileData && fileData.file.type.startsWith("video/") && (
              <video
                src={fileData.url}
                className="rounded-lg object-cover w-full max-h-[500px]"
                controls
              />
            )}

            <div
              dangerouslySetInnerHTML={{ __html: value }}
              className="hard-reset"
            />
            <div className="flex justify-between items-center">
              <label className="text-muted-foreground">
                {moment().format("MMM DD, hh:mm A")}
              </label>
            </div>
          </CardContent>
        </Card>
        <Editor value={value} onChange={setValue} />
        <div className="space-x-4">
          <Button onClick={attachFile} type="submit">
            Attach
          </Button>

          {fileData && (
            <Button type="submit" onClick={() => setFileData(null)}>
              Reset
            </Button>
          )}

          <Button onClick={createPost} type="submit">
            Post
          </Button>
        </div>
      </div>
      {isLoading && <Skeleton active />}

      {data &&
        data.map((item: any) => (
          <Card key={item._id} className="mt-8">
            <CardContent className="space-y-3">
              {item.attachment && item.type.startsWith("image/") && (
                <img
                  src={`${env.VITE_S3_URL}/${item.attachment}`}
                  className="rounded-lg object-cover w-full max-h-[500px]"
                />
              )}
              {item.attachment && item.type.startsWith("video/") && (
                <video
                  src={`${env.VITE_S3_URL}/${item.attachment}`}
                  className="rounded-lg object-cover w-full max-h-[500px]"
                  controls
                />
              )}

              <div
                dangerouslySetInnerHTML={{ __html: item.content }}
                className="hard-reset"
              />
              <div className="flex justify-between items-center">
                <label className="text-sm font-normal text-muted-foreground">
                  {moment(item.createdAt).format("MMM DD YYYY, hh:mm A")}
                </label>
              </div>
              <Divider />
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                >
                  <Heart className="h-4 w-4" />
                  {item.like || 0}
                </Button>
                <Button
                  type="submit"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ThumbsDown className="h-4 w-4" />
                  {item.dislike || 0}
                </Button>
                <Button
                  type="submit"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground hover:text-accent"
                >
                  <MessageCircle className="h-4 w-4" />
                  {item.comment || 0}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

export default Posts;
