import React from "react";
import styled from "styled-components";
import { Alert } from "styled-icons/octicons";

const StyledMessage = styled.div`
  color: #ededed;
  font-size: 16px;
`;

interface Props {
  children?: React.ReactNode;
}

export default function Message(props: Props) {
  return (
    <StyledMessage>
      <Alert size={20} color={"#F44336"} />
      {props.children}
    </StyledMessage>
  );
}
