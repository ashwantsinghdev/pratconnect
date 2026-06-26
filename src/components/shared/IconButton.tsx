import type{ FC } from "react";
import "remixicon/fonts/remixicon.css";

const IconButtonModel = {
  primary:
    "bg-blue-50 hover:bg-blue-500 hover:text-white rounded font-medium text-blue-400 w-9 h-9 flex item-center justify-center",
  secondary:
    "bg-indigo-50 hover:bg-indigo-500 hover:text-white rounded font-medium text-white text-indigo-400 w-9 h-9 flex items-center justify-center",
  danger:
    "bg-rose-50 hover:bg-rose-500 hover:text-white rounded font-medium text-rose-400 w-9 h-9 flex items-center justify-center",
  warning:
    "bg-amber-50 hover:bg-amber-500 hover:text-white rounded font-medium text-amber-400 w-9 h-9 flex items-center justify-center",
  dark: "bg-zinc-50 hover:bg-zinc-500 hover:text-white rounded font-medium text-zinc-400 w-9 h-9 flex item-center justify-center",
  success:
    "bg-green-50 hover:bg-green-500 hover:text-white rounded font-medium text-green-400 w-9 h-9 flex items-center justify-center",
  info: "bg-cyan-50 hover:bg-cyan-500 hover:text-white rounded font-medium text-cyan-400 w-9 h-9 flex items-center justify-center",
};

interface IconButtonInterface {
  type?:
    | "primary"
    | "secondary"
    | "danger"
    | "warning"
    | "dark"
    | "success"
    | "info";
  onClick?: () => void;
  icon: string;
  key?: string | number;
}

const IconButton: FC<IconButtonInterface> = ({
  key = 0,
  type = "primary",
  onClick,
  icon,
}) => {
  return (
    <button className={IconButtonModel[type]} onClick={onClick} key={key}>
      <i className={`ri-${icon} text-base`}></i>
    </button>
  );
};

export default IconButton;
