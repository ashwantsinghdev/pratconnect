export interface onOfferInterface {
    offer:RTCSessionDescriptionInit;
    from:any;
    type:"video" | "audio" |"chat"
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
  | "/public/sound/ring.mp3"
  | "/public/sound/reject.mp3"
  | "/public/sound/busy.mp3"
  | "/public/sound/chat.mp3";

const Video = () => {
  return null;
};

export default Video;
