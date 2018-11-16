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

function getColorWithAlpha(props: StyledProps, alpha: number) {
  switch (props.color) {
    case "red":
      return `rgba(224, 73, 128, ${alpha})`;
    case "green":
      return `rgba(67, 160, 71, ${alpha})`;
    default:
      return white;
  }
}

function getBackgroundColor(props: StyledProps, alpha: number = 1) {
  switch (props.type) {
    case "primary":
      return getColorWithAlpha(props, alpha);
  }
  return alpha ? getColorWithAlpha(props, alpha) : "transparent";
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
  min-height: 30px;
  background: ${(props: StyledProps) =>
    getBackgroundColor(props, props.type !== "primary" ? 0 : 1)};
  color: ${(props: StyledProps) => getColor(props)};
  border: ${(props: StyledProps) => getBorder(props)};
  border-radius: 2px;
  padding: 5px 10px;
  cursor: pointer;

  &:hover {
    background: ${(props: StyledProps) =>
      getBackgroundColor(
        props,
        props.type === "muted" ? 0 : !props.type ? 0.08 : 0.9
      )};
  }
`;

const StyledDisabledButton = styled(StyledButton)`
  background-color: gray;
  border: 0;
  color: ${gray};
  cursor: default;

  &:hover {
    background: gray;
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
  const Component = props.disabled ? StyledDisabledButton : StyledButton;
  return (
    <Component
      type={props.style}
      color={props.color || "green"}
      onClick={props.disabled ? void 0 : props.onClick}
    >
      {props.children}
    </Component>
  );
}
