import type { FC } from "react";

interface InputInterFace {
  name:string
  type?:string
  placeholder?:string
  key?:string | number

}

const Input:FC<InputInterFace> =({name,type="text",placeholder,key=0})=>{
  return(
    <input
    name={name}
    type={type}
    className="border border-gray-300 rounded px-3 py-2 w-full"
    placeholder={placeholder}
    key={key}
    />
  )
}

export default Input