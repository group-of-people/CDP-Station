import * as React from "react";
import styled from "styled-components";

interface StyledProps {
  red: boolean;
}

const StyledButton = styled.button`
  text-transform: uppercase;
  min-width: 100px;
  background: transparent;
  color: ${(props: StyledProps) => (props.red ? "#DD0426" : "#14CC60")};
  border: 2px solid
    ${(props: StyledProps) => (props.red ? "#DD0426" : "#14CC60")};
  border-radius: 2px;
  padding: 5px;
  font-weight: bold;
`;

interface Props {
  children?: React.ReactNode;

  red?: boolean;

  onClick: () => void;
}

export default function Button(props: Props) {
  return (
    <StyledButton red={!!props.red} onClick={props.onClick}>
      {props.children}
    </StyledButton>
  );
}
