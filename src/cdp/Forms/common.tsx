import React from "react";
import styled from "styled-components";
import CDP from "../../store/cdp";
import { observer } from "mobx-react";

interface MaxHintProps {
  value: number;
  onChange: (value: string) => void;
}

export function MaxHint(props: MaxHintProps) {
  const { value, onChange } = props;
  return (
    <>
      Max{" "}
      <span
        style={{
          cursor: "pointer",
          borderBottom: "2px dashed #d1d1d1",
          color: "#d1d1d1"
        }}
        onClick={() => onChange("" + value)}
      >
        {value.toFixed(4)}
      </span>
    </>
  );
}

export const Label = styled.div`
  color: #b5b5b5;
  margin-top: 10px;
  font-size: 20px;
  margin-bottom: 5px;
`;

interface Props {
  cdp: CDP;
}

function LiquidationPriceSFC(props: Props) {
  const { cdp } = props;
  return (
    <div>
      <Label> Liquidation Price</Label>
      {cdp.liquidationPrice.get()} USD/ETH
    </div>
  );
}

export const LiquidationPrice = observer(LiquidationPriceSFC);
