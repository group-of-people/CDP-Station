import React from "react";
import styled from "styled-components";

interface StyledProps {
  type?: "primary" | "muted";
  color: "red" | "green" | "gray";
}

const green = "#43A047";
const red = "#E04980";
const gray = "#b5b5b5";
const white = "#ededed";

function getColor(props: StyledProps) {
  if (props.type === "primary") {
    return white;
  }
  if (props.type === "muted") {
    return gray;
  }
  switch (props.color) {
    case "red":
      return red;
    case "green":
      return green; //"#88C142";
    default:
      return white;
  }
}

function getBackgroundColor(props: StyledProps) {
  switch (props.type) {
    case "primary":
      switch (props.color) {
        case "red":
          return red;
        case "green":
          return green;
        case "gray":
          return gray;
      }
  }
  return "transparent";
}

function getBorder(props: StyledProps) {
  if (props.type === "muted") {
    return "0";
  }

  return `1px solid ${getBackgroundColor({ ...props, type: "primary" })}`;
}

const StyledButton = styled.button`
  text-transform: uppercase;
  min-width: 120px;
  background: ${(props: StyledProps) => getBackgroundColor(props)};
  color: ${(props: StyledProps) => getColor(props)};
  border: ${(props: StyledProps) => getBorder(props)};
  border-radius: 2px;
  padding: 5px;
  cursor: pointer;

  &:hover {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.24);
    transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 1px solid ${gray};
  }
`;

interface Props {
  children?: React.ReactNode;
  disabled?: boolean;
  style?: "primary" | "muted";
  color?: "red" | "green" | "gray";

  onClick: () => void;
}

export default function Button(props: Props) {
  return (
    <StyledButton
      type={props.style}
      color={props.color || "green"}
      onClick={props.disabled ? void 0 : props.onClick}
    >
      {props.children}
    </StyledButton>
  );
}
