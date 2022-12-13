import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: any;
}

export const Button: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <button
      className={twMerge(
        "border-2 min-w-[5rem]  rounded py-2 px-3 text-xl leading-none border-zinc-500 text-white hover:border-white",
        props.disabled && "bg-zinc-500 opacity-20 pointer-events-none",
        className
      )}
      {...props}
    >
      {props.icon && <FontAwesomeIcon icon={props.icon} />} {props.children}
    </button>
  );
};
