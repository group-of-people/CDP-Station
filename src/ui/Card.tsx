import React from "react";
import styled from "styled-components";

interface SceneProps {
  extra: boolean;
}

const Scene = styled.div`
  margin: 30px;
  display: flex;
  width: ${(props: SceneProps) => (props.extra ? "600px" : "300px")};
  height: 400px;
  perspective: 600px;
`;

const Extra = styled.div`
  width: 300px;
  flex-shrink: 0;
  background-color: #394349;
`;

const CardSidesContainer = styled.div`
  width: 300px;
  height: 100%;
  position: relative;
  transition: transform 0.5s;
  transform-style: preserve-3d;
`;

const Side = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 20px;
  background-color: #394349;
  backface-visibility: hidden;
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
