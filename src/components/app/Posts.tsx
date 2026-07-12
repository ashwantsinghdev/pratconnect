const env = import.meta.env;
import { useState } from "react";
import { Button } from "../shared/Button";
import { Card, CardContent } from "../shared/Card";
import Editor from "../shared/Editor";

import { v4 as uuid } from "uuid";
import {
  MessageSquareText,
  Paperclip,
  X,
  Send,
} from "lucide-react";;

import { Skeleton } from "../shared/Skeleton";
import { toast } from "react-toastify";


import CatchError from "../../lib/CatchError";
import HttpInterceptor from "../../lib/HttpInterceptor";
import moment from "moment";
import useSWR, { mutate } from "swr";

import Fetcher from "../../lib/Fetcher";

interface FileDataInterface {
  url: string;
  file: File;
}

interface PostsProps {
  showComposer?: boolean;
}

const Posts = ({ showComposer = true }: PostsProps) => {
  const { data, isLoading } = useSWR("/post", Fetcher);

  const [value, setValue] = useState("");
  const [fileData, setFileData] = useState<FileDataInterface | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
      toast.success("Post created successfully");
      setFileData(null);
      setValue("");
    } catch (err) {
      CatchError(err);
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-0 sm:px-2">
      {showComposer && (
        <div className="flex flex-col gap-8 mb-8">
          {value.length === 0 && (
            <h1 className="text-lg font-medium ">Write your post here</h1>
          )}
          <Card>
            <CardContent className="space-y-8">
              {fileData && fileData.file.type.startsWith("image/") && (
                <img
                  src={fileData.url}
                  className="rounded-lg object-cover w-full max-h-125"
                />
              )}
              {fileData && fileData.file.type.startsWith("video/") && (
                <video
                  src={fileData.url}
                  className="rounded-lg object-cover w-full max-h-125"
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
          <div className="overflow-x-auto">
            <Editor value={value} onChange={setValue} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={attachFile} type="submit" className="gap-1.5">
              <Paperclip className="h-4 w-4" />
              Attach
            </Button>

            {fileData && (
              <Button
                type="submit"
                variant="secondary"
                className="gap-1.5"
                onClick={() => setFileData(null)}
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}

            <Button
              onClick={createPost}
              type="submit"
              variant="gradient"
              className="gap-1.5"
            >
              <Send className="h-4 w-4" />
              Post
            </Button>
          </div>
        </div>
      )}
      {isLoading && <Skeleton active />}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-x-8 gap-y-10 mt-8">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {data.map((item: any) => (
            <article
              key={item._id}
              className="flex flex-col h-full border border-border rounded-xl overflow-hidden bg-card"
            >
              {/* Fixed-height slot — every post gets one, image or not,
                  so cards never differ in height because of content type. */}
              <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden shrink-0">
                {item.attachment && item.type.startsWith("image/") && (
                  <img
                    src={`${env.VITE_S3_URL}/${item.attachment}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {item.attachment && item.type.startsWith("video/") && (
                  <video
                    src={`${env.VITE_S3_URL}/${item.attachment}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    controls
                  />
                )}
                {!item.attachment && (
                  <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-accent/10 via-muted to-amber-400/10">
                    <MessageSquareText className="h-12 w-12 text-accent/40" />
                  </div>
                )}
                {item.attachment && (
                  <span className="absolute left-3 bottom-3 bg-foreground/90 text-background text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-md">
                    {item.type.startsWith("video/") ? "Video" : "Photo"}
                  </span>
                )}
              </div>

              <div className="flex flex-col flex-1 p-5">
                <div
                  dangerouslySetInnerHTML={{ __html: item.content }}
                  className={`hard-reset text-xl font-bold leading-snug mb-2 ${
                    expandedPosts.has(item._id) ? "" : "line-clamp-3"
                  }`}
                />
                {item.content?.replace(/<[^>]*>/g, "").length > 150 && (
                  <button
                    onClick={() => toggleExpand(item._id)}
                    className="text-sm font-medium text-accent hover:underline mb-3 inline-block self-start"
                  >
                    {expandedPosts.has(item._id) ? "View less" : "View more"}
                  </button>
                )}

                {/* mt-auto pins this row to the bottom of the card no matter
                    how short the text above it is; border-t is the divider
                    you asked for, on every post, text-only included. */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <label className="text-sm text-muted-foreground">
                    {moment(item.createdAt).format("MMM D, YYYY")}
                  </label>
                 
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;