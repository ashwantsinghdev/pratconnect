import type { FC } from "react";
import "remixicon/fonts/remixicon.css";
import { cn } from "@/lib/utils";

interface DrawerInterface {
  children?: string;
  title?: string;
  open?: boolean;
  onClose?: () => void;
  key?: string | number;
}

const Drawer: FC<DrawerInterface> = ({
  children = "you content goes",
  key = 0,
  title = "you title goes ",
  open = true,
  onClose,
}) => {
  return (
    <div
      key={key}
      className={cn(
        "shadow-lg fixed top-0 right-0 w-4/5 sm:w-6/12 h-full overflow-auto p-8 z-[10000] space-y-4 bg-card transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full",
      )}
    >
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="border-b border-border -mx-8" />
      <div className="text-muted-foreground">{children}</div>
      <button className="absolute top-6 right-6" onClick={onClose}>
        <i className="ri-close-circle-fill"></i>
      </button>
    </div>
  );
};

export default Drawer;
