import React from "react";
import styled from "styled-components";
//import { Alert } from "styled-icons/octicons";
//import { ErrorOutline as Alert } from "styled-icons/material";
import { AlertTriangle as Alert } from "styled-icons/feather/";

const StyledMessage = styled.div`
  display: flex;
  color: #ededed;
  font-size: 16px;
  align-items: center;
`;

interface Props {
  children?: React.ReactNode;
}

export default function Message(props: Props) {
  return (
    <StyledMessage>
      <div style={{ padding: "0 10px" }}>
        <Alert size={40} color={"#F44336"} />
      </div>
      <div>{props.children}</div>
    </StyledMessage>
  );
}
