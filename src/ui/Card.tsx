import React from "react";
import styled, { keyframes } from "styled-components";
import { CARD_PRIMARY } from "./colors";

interface SceneProps {
  extra: boolean;
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

const Scene = styled.div`
  margin: 30px;
  display: flex;
  width: ${(props: SceneProps) => (props.extra ? "600px" : "300px")};
  height: 400px;
  perspective: 600px;
  animation: ${appear} 0.3s ease-out
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
`;

const Extra = styled.div`
  width: 300px;
  flex-shrink: 0;
  background-color: ${CARD_PRIMARY};
`;

const CardSidesContainer = styled.div`
  width: 300px;
  height: 100%;
  position: relative;
  transition: transform 0.5s;
  transform-style: preserve-3d;
`;

interface SideProps {
  elevated?: boolean;
}

const Side = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 20px;
  background-color: ${CARD_PRIMARY};
  backface-visibility: hidden;
  box-shadow: ${(props: SideProps) =>
    props.elevated
      ? "0 14px 28px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.22);"
      : "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)"};
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.22);
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
      onClick={props.onClick}
      style={{
        cursor: props.onClick ? "pointer" : void 0
      }}
    >
      {!!props.extra && <Extra>{props.extra}</Extra>}
      <CardSidesContainer
        style={{
          transform: props.flipped ? "rotateY(-180deg)" : "rotateY(0deg)"
        }}
      >
        <Side>{props.children}</Side>
        <Side
          elevated
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
