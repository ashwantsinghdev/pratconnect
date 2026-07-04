import type { FC } from "react";
import "remixicon/fonts/remixicon.css";

const IconButtonModel = {
  primary:
    "bg-primary/10 hover:bg-primary hover:text-primary-foreground rounded-lg font-medium text-primary w-9 h-9 flex items-center justify-center",
  secondary:
    "bg-secondary hover:bg-secondary/70 rounded-lg font-medium text-secondary-foreground w-9 h-9 flex items-center justify-center",
  danger:
    "bg-destructive/10 hover:bg-destructive hover:text-primary-foreground rounded-lg font-medium text-destructive w-9 h-9 flex items-center justify-center",
  warning:
    "bg-accent/10 hover:bg-accent hover:text-accent-foreground rounded-lg font-medium text-accent w-9 h-9 flex items-center justify-center",
  dark: "bg-muted hover:bg-foreground hover:text-background rounded-lg font-medium text-muted-foreground w-9 h-9 flex items-center justify-center",
  success:
    "bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-lg font-medium text-emerald-500 w-9 h-9 flex items-center justify-center",
  info: "bg-sky-50 hover:bg-sky-500 hover:text-white rounded-lg font-medium text-sky-500 w-9 h-9 flex items-center justify-center",
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
