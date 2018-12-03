import React from "react";
import styled from "styled-components";

const DimmerContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

interface Props {
  children?: React.ReactNode;
}

export default function Dimmer(props: Props) {
  return (
    <DimmerContainer>
      <div>{props.children}</div>
    </DimmerContainer>
  );
}
