import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  margin-left: 2px;
  margin-bottom: 5px;
  font-size: 20px;
  color: #d1d1d1;
  display: block;
`;

const StyledInputWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  background-color: #31383d;
  border: 2px solid #434b53;
  border-radius: 2px;
`;

const StyledInput = styled.input`
  flex: 1;
  font-size: 20px;
  color: #ededed;
  border: 0;
  background: transparent;
  margin: 0 10px;
  padding-right: 40px;
  overflow: hidden;
`;

const Hint = styled.div`
  padding: 0 5px;
  color: ${(props: { error: boolean }) => (props.error ? "#EF5350" : "#d1d1d1")}
  text-align: right;
`;

const Unit = styled.div`
  position: absolute;
  right: 15px;
  top: 0px;
  bottom: 0px;
  color: #929292;
  display: flex;
  align-items: center;
`;

interface Props {
  label?: string;
  value: string;
  unit: string;
  error?: boolean;
  children?: React.ReactNode;
  onChange: (e: React.FormEvent<HTMLInputElement>) => void;
}

export default function Input(props: Props) {
  return (
    <Wrapper>
      {!!props.label && <Label>{props.label}</Label>}
      <StyledInputWrapper>
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: 0,
            display: "flex"
          }}
        >
          <StyledInput
            placeholder={props.label}
            value={props.value}
            onChange={props.onChange}
          />
          <Unit>{props.unit}</Unit>
        </div>
      </StyledInputWrapper>
      {!!props.children && <Hint error={!!props.error}>{props.children}</Hint>}
    </Wrapper>
  );
}
