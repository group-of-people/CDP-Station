import React from "react";
import styled from "styled-components";

const DimmerContainer = styled.h1`
  color: #ededed;
  font-size: 30px;
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
