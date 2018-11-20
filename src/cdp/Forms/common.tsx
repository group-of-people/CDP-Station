import React from "react";

interface MaxHintProps {
  value: number;
  onChange: (value: string) => void;
}

export function MaxHint(props: MaxHintProps) {
  const { value, onChange } = props;
  return (
    <>
      Max{" "}
      <span
        style={{
          cursor: "pointer",
          borderBottom: "2px dashed #d1d1d1",
          color: "#d1d1d1"
        }}
        onClick={() => onChange("" + value)}
      >
        {value.toFixed(4)}
      </span>
    </>
  );
}
