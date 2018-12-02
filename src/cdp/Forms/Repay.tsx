import React, { Component } from "react";
import { Button, Input, Header } from "../../ui";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store } from "../../store";
import CDP from "../../store/cdp";
import { inject, observer } from "mobx-react";
import { LiquidationPrice, MaxHint } from "./common";

interface Props {
  store?: Store;
  cdp: CDP;
  previewCdp: CDP;

  onRequestClose: () => void;
}

interface State {
  amountDAI: string;
}

export class Repay extends Component<Props, State> {
  state: State = {
    amountDAI: ""
  };

  render() {
    const amountDAI = parseInputFloat(this.state.amountDAI);
    let valid = false;
    if (amountDAI > 0 && this.props.cdp.daiDebt.get().toNumber() >= amountDAI) {
      valid = true;
    }

    const max = Math.min(
      this.props.store!.balances.get()!.daiBalance.toNumber(),
      this.props.cdp.daiDebt.get().toNumber()
    );

    return (
      <>
        <div style={{ flex: 1 }}>
          <Header>
            Repay <span style={{ fontSize: 16 }}> (requires MKR)</span>
          </Header>
          <Input
            unit={"DAI"}
            value={this.state.amountDAI}
            onChange={this.handleChange}
          >
            <MaxHint
              value={max}
              onChange={(amountDAI: string) => this.onChange(amountDAI)}
            />
          </Input>
          <LiquidationPrice cdp={this.props.previewCdp} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            color={"gray"}
            style={"muted"}
            onClick={this.props.onRequestClose}
          >
            Cancel
          </Button>
          <Button
            color={"green"}
            style={"primary"}
            disabled={!valid}
            onClick={this.repayDAI}
          >
            Repay
          </Button>
        </div>
      </>
    );
  }

  repayDAI = () => {
    this.props.store!.repayDAI(
      parseInputFloat(this.state.amountDAI),
      this.props.cdp
    );
    this.props.onRequestClose();
  };

  handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (!isValidFloatInputNumber(value)) {
      return;
    }

    this.onChange(value);
  };

  onChange = (value: string) => {
    this.setState({ amountDAI: value }, () => {
      this.props.previewCdp.update(
        this.props.previewCdp.ethLocked.get(),
        Math.max(
          0,
          this.props.cdp.daiDebt.get().toNumber() - parseInputFloat(value)
        )
      );
    });
  };
}

export default inject("store")(observer(Repay));
