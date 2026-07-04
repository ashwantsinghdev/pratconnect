import type { FC } from "react";

const SmallButtonModel = {
  primary:
    "w-full bg-primary hover:bg-primary/85 rounded-lg font-medium text-primary-foreground px-3 py-1 text-sm",
  secondary:
    "w-full bg-secondary hover:bg-secondary/70 rounded-lg font-medium text-secondary-foreground px-3 py-1 text-sm",
  danger:
    "w-full bg-destructive hover:bg-destructive/85 rounded-lg font-medium text-primary-foreground px-3 py-1 text-sm",
  warning:
    "w-full bg-accent hover:bg-accent/85 rounded-lg font-medium text-accent-foreground px-3 py-1 text-sm",
  dark: "w-full bg-foreground hover:bg-foreground/85 rounded-lg font-medium text-background px-3 py-1 text-sm",
  success:
    "w-full bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium text-white px-3 py-1 text-sm",
  info: "w-full bg-sky-500 hover:bg-sky-600 rounded-lg font-medium text-white px-3 py-1 text-sm",
};

interface SmallButtonInterface {
  children?: string;
  type?:
    | "primary"
    | "secondary"
    | "danger"
    | "warning"
    | "dark"
    | "success"
    | "info";
  onClick?: () => void;
  icon?: string;
  key?: string | number;
  loading?: boolean;
}

const SmallButton: FC<SmallButtonInterface> = ({
  key = 0,
  children = "Submit",
  type = "primary",
  onClick,
  icon,
  loading = false,
}) => {
  if (loading)
    return (
      <button disabled className="text-muted-foreground">
        <i className="fa fa-spinner fa-spin mr-2"></i>
        Processing...
      </button>
    );
  return (
    <button className={SmallButtonModel[type]} onClick={onClick} key={key}>
      {icon && <i className={`ri-${icon} mr-1`}></i>}
      {children}
    </button>
  );
};

export default SmallButton;
