import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  margin-bottom: 30px;
`;

const Label = styled.label`
  margin-left: 2px;
  font-size: 24px;
  color: #929292;
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

const Preview = styled.div`
  padding: 0 5px;
  display: flex;
  color: #929292;
  border-left: 2px solid #434b53;
  height: 100%;
  align-items: center;
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
  label: string;
  value: string;
  unit: string;
  previewContent?: React.ReactNode;
  onChange: (e: React.FormEvent<HTMLInputElement>) => void;
}

export default function Input(props: Props) {
  return (
    <Wrapper>
      <Label>{props.label}</Label>
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
        {!!props.previewContent && <Preview>{props.previewContent}</Preview>}
      </StyledInputWrapper>
    </Wrapper>
  );
}
