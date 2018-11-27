import React from "react";
import styled, { keyframes, css } from "styled-components";
import { CARD_PRIMARY } from "./colors";

interface SceneProps {
  extra: boolean;
  animate: boolean;
}

const appear = keyframes`
  0% {
    display: none;
    opacity: 0;
  }
	1% {
    display: block;
    opacity: 0;
  }
	100% {
    display: block;
    opacity: 1;
  }
`;

const hideShadow = keyframes`
  0% {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.22)
  }
	49% {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.22)
  }
  50% {
    box-shadow: none;
  }
	100% {
box-shadow: none;
  }
`;

const hideShadow2 = keyframes`
  0% {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)
  }
	49% {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.22)
  }
  50% {
    box-shadow: none;
  }
	100% {
box-shadow: none;
  }
`;

const showShadow = keyframes`
  0% {
    box-shadow: none
  }
  49% {
    box-shadow: none
  }
	50% {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.22);
  }

	100% {
box-shadow: 0 14px 28px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.22);
  }
`;

const Scene = styled.div`
  margin: 30px;
  display: flex;
  width: ${(props: SceneProps) => (props.extra ? "600px" : "300px")};
  height: 400px;
  perspective: 600px;
  animation: ${(props: SceneProps) =>
    props.animate
      ? css`
          ${showShadow} 1s forwards;
        `
      : css`
          ${appear} 0.3s ease-out;
        `};
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
`;

const Extra = styled.div`
  width: 300px;
  flex-shrink: 0;
  background-color: ${CARD_PRIMARY};
  box-shadow: ${(props: SideProps) =>
    props.elevated
      ? "0 14px 28px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.22);"
      : "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)"};
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: ${(props: SideProps) =>
    props.animate &&
    css`
      ${hideShadow2} 1s forwards;
    `};
`;

const CardSidesContainer = styled.div`
  width: 300px;
  height: 100%;
  position: relative;
  transition: transform 0.5s;
  transform-style: preserve-3d;
`;

interface SideProps {
  noHover?: boolean;
  elevated?: boolean;
  animate?: boolean;
}

const Side = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 30px 20px;
  background-color: ${CARD_PRIMARY};
  backface-visibility: hidden;
  box-shadow: ${(props: SideProps) =>
    props.elevated
      ? "0 14px 28px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.22)"
      : "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)"};
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  ${(props: SideProps) =>
    props.animate
      ? css`
          animation: ${hideShadow} 1s forwards;
        `
      : ""} &:hover {
    ${(props: SideProps) =>
      props.noHover
        ? ""
        : "box-shadow: 0 14px 28px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.22);"};
  }
`;

interface Props {
  children?: React.ReactNode;

  extra?: React.ReactNode;

  flipped?: boolean;
  backside?: React.ReactNode;

  onClick?: () => void;
}

export default function Card(props: Props) {
  return (
    <Scene
      extra={!!props.extra}
      animate={!!props.extra && !!props.flipped}
      onClick={props.onClick}
      style={{
        cursor: props.onClick ? "pointer" : void 0
      }}
    >
      {!!props.extra && (
        <Extra
          animate={!!props.extra && !!props.flipped}
          elevated={props.flipped}
        >
          {props.extra}
        </Extra>
      )}
      <CardSidesContainer
        style={{
          transform: props.flipped ? "rotateY(-180deg)" : "rotateY(0deg)"
        }}
      >
        <Side noHover={!props.onClick}>{props.children}</Side>
        <Side
          elevated
          animate={!!props.extra && !!props.flipped}
          style={{
            transform: "rotateY(-180deg)"
          }}
        >
          {props.backside}
        </Side>
      </CardSidesContainer>
    </Scene>
  );
}
