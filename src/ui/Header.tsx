import React from "react";
import styled from "styled-components";

const StyledHeader = styled.div`
  color: #ededed;
  font-size: 30px;
`;

interface Props {
  children?: React.ReactNode;
}

export default function Header(props: Props) {
  return <StyledHeader>{props.children}</StyledHeader>;
}
