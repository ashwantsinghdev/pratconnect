import { useRef } from "react";
import { toast, type Id } from "react-toastify";

interface NotifyOpenOptions {
  message: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  actions?: React.ReactNode[];
  onClose?: () => void;
}

export function useNotify() {
  const toastId = useRef<Id | null>(null);

  const open = ({
    message,
    description,
    duration = 4.5,
    actions,
    onClose,
  }: NotifyOpenOptions) => {
   
    if (toastId.current !== null) {
      toast.dismiss(toastId.current);
    }

    toastId.current = toast(
      <div className="space-y-2">
        <div>{message}</div>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>,
      {
        autoClose: duration * 1000,
        closeOnClick: false,
        onClose,
      },
    );
  };
  const destroy = () => {
    if (toastId.current !== null) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
  };

  return { open, destroy };
}
