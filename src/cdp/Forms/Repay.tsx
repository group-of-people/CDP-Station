import React, { Component } from "react";
import { Button, Input, Header } from "../../ui";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store } from "../../store";
import CDP from "../../store/cdp";
import { inject, observer } from "mobx-react";

interface Props {
  store?: Store;
  cdp: CDP;

  onRequestClose: () => void;
}

interface State {
  amountDAI: string;
  repaying: boolean;
}

export class Repay extends Component<Props, State> {
  state: State = {
    amountDAI: Math.min(
      this.props.store!.balances.get()!.daiBalance.toNumber(),
      this.props.cdp.daiDebt.get().toNumber()
    ).toString(),
    repaying: false
  };

  render() {
    const amountDAI = parseInputFloat(this.state.amountDAI);
    let valid = false;
    if (amountDAI > 0 && this.props.cdp.daiDebt.get().toNumber() >= amountDAI) {
      valid = true;
    }

    return (
      <>
        <div style={{ flex: 1 }}>
          <Header>
            Repay <span style={{ fontSize: 16 }}> (requires MKR)</span>
          </Header>
          <div style={{ marginTop: 20 }}>
            <Input
              unit={"DAI"}
              value={this.state.amountDAI}
              onChange={this.handleChange}
            />
          </div>
          DAI Debt: {this.props.cdp.daiDebt.get().toString()} <br />
          MKR Balance:{" "}
          {this.props.store!.balances.get()!.mkrBalance.toString(4)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button red onClick={this.props.onRequestClose}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={this.repayDAI}>
            Repay
          </Button>
        </div>
      </>
    );
  }

  repayDAI = async () => {
    this.setState({ repaying: true });
    await this.props.store!.repayDAI(
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
    this.setState({ amountDAI: value });
  };
}

export default inject("store")(observer(Repay));
