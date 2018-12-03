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

const Scene = styled.div`
  margin: 30px;
  display: flex;
  width: ${(props: SceneProps) => (props.extra ? "600px" : "300px")};
  height: 400px;
  perspective: 600px;
  animation: ${appear} 0.3s ease-out;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
`;

const Extra = styled.div`
  width: 300px;
  height: 100%;
  flex-shrink: 0;
  background-color: ${CARD_PRIMARY};
  margin-top: ${(props: SideProps) => (props.elevated ? "-5px" : "0")};
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
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
  margin-top: ${(props: SideProps) => (props.elevated ? "-5px" : "0")};
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover {
    ${(props: SideProps) => (props.noHover ? "" : "margin-top: -5px")};
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
