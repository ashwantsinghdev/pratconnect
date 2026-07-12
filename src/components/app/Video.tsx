import Context from "@/Context";
import CatchError from "@/lib/CatchError";
import HttpInterceptor from "@/lib/HttpInterceptor";
import socket from "@/lib/Socket";
import getId from "@/lib/getId";

import {
  Dialog,
  DialogContent,
} from "../shared/Dialog";
import { useNotify } from "../shared/useNotify"

import { useContext, useRef, useState,useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../shared/Button";
import {
  Video as VideoIcon,
  VideoOff,
  Mic,
  MicOff,
  ScreenShare,
  ScreenShareOff,
  Phone,
  PhoneOff,
} from "lucide-react";
export interface onOfferInterface {
  offer: RTCSessionDescriptionInit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: any;
  type: "video" | "audio" | "chat";
}

export interface onAnswereInterface {
  answere: RTCSessionDescriptionInit;
  from: unknown;
}

export interface onCandidateInterface {
  candidate: RTCIceCandidateInit;
  from: string;
}

export type CallType = "pending" | "calling" | "incoming" | "talking" | "end";

export type AudioSrcType =
  | "/sound/ring.mp3"
  | "/sound/reject.mp3"
  | "/sound/busy.mp3"
  | "/sound/chat.mp3";

function getCallTiming(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}

const Video = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { session, liveActiveSession, sdp, setSdp } = useContext(Context);
  const { id } = useParams();
  const endedByMe = useRef(false);
  const autoCallTriggered = useRef(false);
  const notify = useNotify();
  const localVideoContainerRef = useRef<HTMLDivElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoContainerRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const rtc = useRef<RTCPeerConnection | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const [isVideoSharing, setIsVideoSharing] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMic, setIsMic] = useState(false);
  const [status, setStatus] = useState<CallType>("pending");
  const [timer, setTimer] = useState(0);

  const stopAudio = () => {
    if (!audio.current) return;
    const player = audio.current;
    player.pause();
    player.currentTime = 0;
  };

  const playAudio = (src: AudioSrcType, loop: boolean = false) => {
    stopAudio();
    if (!audio.current) audio.current = new Audio();
    const player = audio.current;
    player.src = src;
    player.loop = loop;
    player.load();
    player.play();
  };

  const ensureLocalStream = async () => {
    const existing = localStreamRef.current;
    if (existing && existing.getTracks().some((t) => t.readyState === "live"))
      return existing;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
      
      ,
    });
    localStreamRef.current = stream;

    const localVideo = localVideoRef.current;
    if (localVideo && !isScreenSharing) localVideo.srcObject = stream;

    setIsVideoSharing(true);
    setIsMic(true);
    return stream;
  };

  const toggleVideo = async () => {
    try {
      if (!isVideoSharing) {
        const stream = await ensureLocalStream();
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) videoTrack.enabled = true;
        if (localVideoRef.current && !isScreenSharing)
          localVideoRef.current.srcObject = stream;
        setIsVideoSharing(true);
        return;
      }

      const videoTrack = localStreamRef.current
        ?.getTracks()
        .find((track) => track.kind === "video");
      if (videoTrack) videoTrack.enabled = false;

      if (localVideoRef.current && !isScreenSharing)
        localVideoRef.current.srcObject = null;

      setIsVideoSharing(false);
    } catch (err) {
      CatchError(err);
    }
  };

  const toggleMic = () => {
    try {
      const audioTrack = localStreamRef.current
        ?.getTracks()
        .find((track) => track.kind === "audio");
      if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
      setIsMic(audioTrack!.enabled);
    } catch (err) {
      CatchError(err);
    }
  };

  const replaceOutgoingVideoTrack = async (track: MediaStreamTrack) => {
    const senderVideoTrack = rtc.current
      ?.getSenders()
      .find((s) => s.track?.kind === "video");
    if (senderVideoTrack) await senderVideoTrack.replaceTrack(track);
  };

  const stopScreenShare = async () => {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);

    const cameraStream = await ensureLocalStream();
    const cameraTrack = cameraStream.getVideoTracks()[0];
    if (cameraTrack) await replaceOutgoingVideoTrack(cameraTrack);

    const localVideo = localVideoRef.current;
    if (localVideo) localVideo.srcObject = cameraStream;
  };

  const toggleScreen = async () => {
    try {
      if (isScreenSharing) return stopScreenShare();

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) return;

      await replaceOutgoingVideoTrack(screenTrack);

      const localVideo = localVideoRef.current;
      if (localVideo) localVideo.srcObject = screenStream;
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      screenTrack.onended = () => stopScreenShare();
    } catch (err) {
      CatchError(err);
    }
  };

  const toggleFullScreen = (type: "local" | "remote") => {
    try {
      if (!isVideoSharing && !isScreenSharing)
        return toast.warn("please start your video first ");

      const videoContainer =
        type === "local"
          ? localVideoContainerRef.current
          : remoteVideoContainerRef.current;
      if (!videoContainer) return;

      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    } catch (err) {
      CatchError(err);
    }
  };

  const webRtcConnection = async () => {
    const localStream = await ensureLocalStream();
    const { data } = await HttpInterceptor.get("/twilio/turn-server");
    rtc.current = new RTCPeerConnection({ iceServers: data });

    localStream.getTracks().forEach((track) => {
      rtc.current?.addTrack(track, localStream);
    });

    rtc.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("candidate", { candidate: e.candidate, to: id });
      }
    };

    rtc.current.onconnectionstatechange = () => {
      console.log(rtc.current?.connectionState);
    };

    rtc.current.ontrack = (e) => {
      const remoteStream = e.streams[0];
      const remoteVideo = remoteVideoRef.current;
      if (!remoteStream || !remoteVideo) return;
      remoteVideo.srcObject = remoteStream;

      const videoTracks = remoteStream.getTracks()[0];
      if (videoTracks) {
        videoTracks.onmute = () => {
          remoteVideo.style.display = "none";
        };
        videoTracks.onunmute = () => {
          remoteVideo.style.display = "block";
        };
        videoTracks.onended = () => {
          remoteVideo.srcObject = null;
          remoteVideo.style.display = "none";
        };
      }
    };
  };

  const startCall = async () => {
    if (status !== "pending" && status !== "end") return;
    try {
      await webRtcConnection();
      const offer = await rtc.current?.createOffer();
      await rtc.current?.setLocalDescription(offer);

      setStatus("calling");
      playAudio("/sound/ring.mp3", true);
      notify.open({
        message: (
          <h1 className="capitalize font-medium">
            {liveActiveSession.fullname}
          </h1>
        ),
        description: "Calling...",
        duration: 30,
        onClose: stopAudio,
        actions: [
          <button
            key="end"
            className="bg-rose-400 px-3 py-1 rounded text-white hover:bg-rose-500"
            onClick={endCallFromLocal}
          >
            End call
          </button>,
        ],
      });
      socket.emit("offer", { offer, to: id, from: session, type: "video" });
    } catch (err) {
      CatchError(err);
    }
  };

  const accept = async (payload: onOfferInterface) => {
    try {
      setSdp(null);
      await webRtcConnection();
      if (!rtc.current) return;

      const offer = new RTCSessionDescription(payload.offer);
      await rtc.current.setRemoteDescription(offer);

      const answere = await rtc.current.createAnswer();
      await rtc.current.setLocalDescription(answere);

      notify.destroy();
      setStatus("talking");
      stopAudio();
      socket.emit("answere", { answere, to: id });
    } catch (err) {
      CatchError(err);
    }
  };

const redirectOnCallEnd = () => {
  setOpen(false);
  const friendId = getId(liveActiveSession);
  if (friendId) {
    navigate(`/app/friends/${friendId}`);
  } else {
    navigate("/app/friends");
  }
};

  const endStreaming = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    rtc.current?.getSenders().forEach((sender) => sender.track?.stop());
    localStreamRef.current = null;
    screenStreamRef.current = null;

    rtc.current?.close();
    rtc.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setIsVideoSharing(false);
    setIsScreenSharing(false);
    setIsMic(false);
  };

  const endCallFromLocal = () => {
    endedByMe.current = true;
    setStatus("end");
    playAudio("/sound/reject.mp3");
    notify.destroy();
const target = getId(liveActiveSession) || id;
    socket.emit("end", { to: target });
    endStreaming();
    setOpen(true);
  };
  const rejectIncomingCall = () => {
    endedByMe.current = true;
    setStatus("pending");
    playAudio("/sound/reject.mp3");
    notify.destroy();
    const target = getId(liveActiveSession) || id;
    socket.emit("end", { to: target });
    endStreaming();
    navigate("/app/friends");
  };

  const onEndCallRemote = () => {
    endedByMe.current = false;
    setStatus("end");
    notify.destroy();
    playAudio("/sound/reject.mp3");
    endStreaming();
    setOpen(true);
    
  };

  const onOffer = (payload: onOfferInterface) => {
    setStatus("incoming");
    notify.open({
      message: (
        <h1 className="capitalize font-medium">{payload.from.fullname}</h1>
      ),
      description: "Incomming call...",
      duration: 30,
      actions: [
        <div key="calls" className="space-x-4">
          <button
            className="bg-accent px-3 py-1.5 rounded-lg text-white hover:opacity-90 inline-flex items-center gap-1.5"
            onClick={() => accept(payload)}
          >
            <Phone className="h-3.5 w-3.5" />
            Accept
          </button>
          <button
            className="bg-destructive px-3 py-1.5 rounded-lg text-white hover:bg-destructive/85 inline-flex items-center gap-1.5"
            onClick={rejectIncomingCall}
          >
            <PhoneOff className="h-3.5 w-3.5" />
            Reject
          </button>
          ,
        </div>,
      ],
    });
  };

  const onCandidate = async (payload: onCandidateInterface) => {
    try {
      if (!rtc.current) return;
      const candidate = new RTCIceCandidate(payload.candidate);
      await rtc.current?.addIceCandidate(candidate);
    } catch (err) {
      CatchError(err);
    }
  };

  const onAnswere = async (payload: onAnswereInterface) => {
    try {
      if (!rtc.current) return;
      const answere = new RTCSessionDescription(payload.answere);
      await rtc.current.setRemoteDescription(answere);
      setStatus("talking");
      stopAudio();
      notify.destroy();
    } catch (err) {
      CatchError(err);
    }
  };

useEffect(() => {
  socket.on("candidate", onCandidate);
  socket.on("answere", onAnswere);
  socket.on("end", onEndCallRemote);

  return () => {
    socket.off("candidate", onCandidate);
    socket.off("answere", onAnswere);
    socket.off("end", onEndCallRemote);
  };
}, []);

  useEffect(() => {
    if (
      location.state?.autoCall &&
      !autoCallTriggered.current &&
      liveActiveSession
    ) {
      autoCallTriggered.current = true;
      startCall();
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveActiveSession]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let interval: any;
    if (status === "talking") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [status]);

useEffect(() => {
  
  if (
    !liveActiveSession &&
    (status === "talking" || status === "calling") &&
    !endedByMe.current
  ) {
    endCallFromLocal();
  }
}, [liveActiveSession, status]);

useEffect(() => {
  if (sdp) {
    notify.destroy();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    onOffer(sdp);
    setSdp(null);
  }
}, [sdp]);

  return (
    <div className="space-y-8">
      <div
        ref={remoteVideoContainerRef}
        className="bg-black w-full h-0 relative pb-[56.25%] rounded-xl "
      >
        <video
          ref={remoteVideoRef}
          muted
          className="w-full h-full absolute top-0 left-0 object-cover"
          autoPlay
          playsInline
        ></video>
        <button
          className="absolute bottom-5 left-5 bg-white text-xs px-2.5 py-1 rounded-lg text-white"
          style={{
            background: "rgba(0,0,0,0.7)",
          }}
        >
          {liveActiveSession && liveActiveSession.fullname}
        </button>

        <button
          onClick={() => toggleFullScreen("remote")}
          className="absolute bottom-5 right-5 bg-white text-xs px-2.5 py-1 rounded-lg text-white hover:scale-125"
          style={{
            background: "rgba(255,255,255,0.1)",
          }}
        >
          <i className="ri-fullscreen-exit-line"></i>
        </button>
      </div>

      {/* small video */}

      <div className=" grid grid-cols-3 gap-4">
        <div
          ref={localVideoContainerRef}
          className="bg-black w-full h-0 relative pb-[56.25%] rounded-xl "
        >
          <video
            ref={localVideoRef}
            muted
            className="w-full h-full absolute top-0 left-0 object-cover"
            autoPlay
            playsInline
          ></video>
          <button
            className=" capitalize absolute bottom-2 left-2 bg-white text-xs px-2.5 py-1 rounded-lg text-white"
            style={{
              background: "rgba(0,0,0,0.7)",
            }}
          >
            {session && session.fullname}
          </button>
          <button
            onClick={() => toggleFullScreen("local")}
            className="absolute bottom-2 right-2 bg-white text-xs px-2.5 py-1 rounded-lg text-white hover:scale-125"
            style={{
              background: "rgba(9,0,0,0.7)",
            }}
          >
            <i className="ri-fullscreen-exit-line"></i>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-3">
          <button
            onClick={toggleVideo}
            className={
              isVideoSharing
                ? "bg-neutral-800 text-white w-12 h-12 rounded-full hover:bg-neutral-700 flex items-center justify-center"
                : "bg-destructive text-white w-12 h-12 rounded-full hover:bg-destructive/85 flex items-center justify-center"
            }
          >
            {isVideoSharing ? (
              <VideoIcon className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={toggleMic}
            className={
              isMic
                ? "bg-neutral-800 text-white w-12 h-12 rounded-full hover:bg-neutral-700 flex items-center justify-center"
                : "bg-destructive text-white w-12 h-12 rounded-full hover:bg-destructive/85 flex items-center justify-center"
            }
          >
            {isMic ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={toggleScreen}
            className={
              isScreenSharing
                ? "bg-accent text-white w-12 h-12 rounded-full hover:opacity-90 flex items-center justify-center"
                : "bg-muted text-foreground w-12 h-12 rounded-full hover:bg-muted/70 flex items-center justify-center"
            }
          >
            {isScreenSharing ? (
              <ScreenShare className="h-5 w-5" />
            ) : (
              <ScreenShareOff className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-4">
          {status === "talking" && <label>{getCallTiming(timer)}</label>}
          {(status === "pending" || status === "end") && (
            <Button
              type="submit"
              variant="gradient"
              onClick={startCall}
              className="gap-1.5"
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
          )}

          {status === "talking" && (
            <Button
              type="button"
              variant="destructive"
              onClick={endCallFromLocal}
              className="gap-1.5"
            >
              <PhoneOff className="h-4 w-4" />
              End
            </Button>
          )}
        </div>
      </div>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => !isOpen && redirectOnCallEnd()}
      >
        <DialogContent>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold">Call Ended</h1>
            <Button type="submit" onClick={redirectOnCallEnd

            }>
              Thank you !
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Video;
