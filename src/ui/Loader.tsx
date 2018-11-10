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

export default Block;
