import type { FC, ReactElement, ReactNode } from "react";

interface CardInterFace {
  children?: ReactNode;
  title?: ReactNode;
  divider?: boolean;
  footer?: ReactElement;
  key?: string | number;
  noPadding?: boolean;
}

const Card: FC<CardInterFace> = ({
  children,
  title,
  divider = false,
  footer,
  noPadding = false,
  key = 0,
}) => {
  return (
    <div
      className={`bg-white shadow-lg ${noPadding ? "" : "px-5 py-4 "} rounded-lg border border-gray-300 space-y-2 `}
      key={key}
    >
      {title && <h1 className="text-lg font-semibold capitalize">{title}</h1>}

      {divider && <div className="border-b border-b-gray-200 -mx-5 my-4"></div>}

      {children && <div className="text-gray-500">{children}</div>}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
};

export default Card;
