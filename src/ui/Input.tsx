import React from "react";

interface Props {
  label: string;
  value: string;
  previewContent?: React.ReactNode;
  onChange: (e: React.FormEvent<HTMLInputElement>) => void;
}

export default function Input(props: Props) {
  return (
    <div>
      <label>{props.label}</label>
      <input
        placeholder={props.label}
        value={props.value}
        onChange={props.onChange}
      />
      {props.previewContent}
    </div>
  );
}
