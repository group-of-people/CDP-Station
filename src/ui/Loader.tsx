// Adopted from styled-loaders

import React from "react";
import styled, { keyframes } from "styled-components";
import { CARD_PRIMARY } from "./colors";

const rotateplane = keyframes`
  0% { transform: perspective(120px) rotateX(0deg) rotateY(0deg); }
	50% {
		transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
  }
	100% {
		transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
	}
`;

interface Props {
  color?: string;
  duration?: string;
  size?: string;
}

const Block = (props: Props) => {
  /* eslint-disable */
  const Spinner = styled.div`
    margin: 100px auto;
    animation: ${rotateplane} 1.2s infinite ease-in-out;
    background: ${props.color || CARD_PRIMARY};
    width: ${props.size || "60px"};
    height: ${props.size || "60px"};
    animation-duration: ${(props: Props) =>
      props.duration ? props.duration : "1.7s"};
  `;
  /* eslint-enable */

  return <Spinner {...props} />;
};

const circular = keyframes`
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;
interface CircularProps {
  color?: string;
  size?: string;
}

const Circular = ({ color, size }: CircularProps) => {
  const Spinner = styled.div`
    position: relative;
    margin: 5px;
    width: ${size || "20px"};
    height: ${size || "20px"};
  `;
  const Circle = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;

    &::before {
      content: "";
      display: block;
      margin: 0 auto;
      width: 15%;
      height: 15%;
      background-color: ${color || CARD_PRIMARY};
      border-radius: 100%;
      animation: ${circular} 1.2s infinite ease-in-out both;
    }
  `;

  const Circle2 = styled(Circle)`
    transform: rotate(30deg);
    &::before {
      animation-delay: -1.1s;
    }
  `;
  const Circle3 = styled(Circle)`
    transform: rotate(60deg);
    &::before {
      animation-delay: -1s;
    }
  `;
  const Circle4 = styled(Circle)`
    transform: rotate(90deg);
    &::before {
      animation-delay: -0.9s;
    }
  `;
  const Circle5 = styled(Circle)`
    transform: rotate(120deg);
    &::before {
      animation-delay: -0.8s;
    }
  `;
  const Circle6 = styled(Circle)`
    transform: rotate(150deg);
    &::before {
      animation-delay: -0.7s;
    }
  `;
  const Circle7 = styled(Circle)`
    transform: rotate(180deg);
    &::before {
      animation-delay: -0.6s;
    }
  `;
  const Circle8 = styled(Circle)`
    transform: rotate(210deg);
    &::before {
      animation-delay: -0.5s;
    }
  `;
  const Circle9 = styled(Circle)`
    transform: rotate(240deg);
    &::before {
      animation-delay: -0.4s;
    }
  `;
  const Circle10 = styled(Circle)`
    transform: rotate(270deg);
    &::before {
      animation-delay: -0.3s;
    }
  `;
  const Circle11 = styled(Circle)`
    transform: rotate(300deg);
    &::before {
      animation-delay: -0.2s;
    }
  `;
  const Circle12 = styled(Circle)`
    transform: rotate(330deg);
    &::before {
      animation-delay: -0.1s;
    }
  `;

  return (
    <Spinner>
      <Circle color={color} />
      <Circle2 color={color} />
      <Circle3 color={color} />
      <Circle4 color={color} />
      <Circle5 color={color} />
      <Circle6 color={color} />
      <Circle7 color={color} />
      <Circle8 color={color} />
      <Circle9 color={color} />
      <Circle10 color={color} />
      <Circle11 color={color} />
      <Circle12 color={color} />
    </Spinner>
  );
};

export { Block, Circular };
