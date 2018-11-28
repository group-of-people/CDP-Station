import React, { Component } from "react";
import { Button, Input, Header } from "../../ui";
import { inject, observer } from "mobx-react";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store } from "../../store";
import CDP from "../../store/cdp";
import { MaxHint, LiquidationPrice } from "./common";

interface Props {
  store?: Store;
  cdp: CDP;
  previewCdp: CDP;

  onRequestClose: () => void;
}

interface State {
  amountETH: string;
}

export class Lock extends Component<Props, State> {
  state: State = {
    amountETH: "0"
  };

  render() {
    const store = this.props.store!;
    const amountETH = parseInputFloat(this.state.amountETH);

    const ethBalance = store.balances.get()!.ethBalance.toNumber();

    let valid = true;
    let amountValid = true;
    if (amountETH > ethBalance) {
      amountValid = false;
    } else if (!amountETH || amountETH < 0) {
      valid = false;
    }

    valid = valid && amountValid;

    return (
      <>
        <div style={{ flex: 1 }}>
          <Header>Deposit</Header>
          <Input
            unit={"ETH"}
            value={this.state.amountETH}
            onChange={this.handleChange}
            error={!amountValid}
          >
            <MaxHint
              value={ethBalance}
              onChange={(amountETH: string) => this.onChange(amountETH)}
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
            onClick={this.lockETH}
          >
            Deposit
          </Button>
        </div>
      </>
    );
  }

  lockETH = () => {
    this.props.store!.lockETH(
      parseInputFloat(this.state.amountETH),
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
    this.setState({ amountETH: value }, () => {
      this.props.previewCdp.update(
        parseInputFloat(value) + this.props.cdp.ethLocked.get(),
        this.props.previewCdp.daiDebt.get().toNumber()
      );
    });
  };
}

export default inject("store")(observer(Lock));
