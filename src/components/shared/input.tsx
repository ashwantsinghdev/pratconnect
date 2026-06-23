import type { FC } from "react";

interface InputInterface {
  name: string;
  type: string;
  placeholder?: string;
  key?: string | number;
}

const input: FC<InputInterface> = ({
  key = 0,
  name,
  placeholder,
  type = "text",
}) => {
  return (
    <input
      name={name}
      type={type}
      className=""
      placeholder={placeholder}
      key={key}
    />
  );
};

export default input;
