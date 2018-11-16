import React, { Component } from "react";
import { Button, Input, Message, Header } from "../../ui";
import { inject, observer } from "mobx-react";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store } from "../../store";
import CDP from "../../store/cdp";

interface Props {
  store?: Store;
  cdp: CDP;

  onRequestClose: () => void;
}

interface State {
  amountETH: string;
  locking: boolean;
}

export class Lock extends Component<Props, State> {
  state: State = {
    amountETH: this.props
      .store!.balances.get()!
      .ethBalance.toNumber()
      .toString(),
    locking: false
  };

  render() {
    const store = this.props.store!;
    const amountETH = parseInputFloat(this.state.amountETH);

    const wethToPeth = store.prices.get()!.wethToPeth;
    const ethLocked = this.props.cdp.ethLocked.get();

    const ethBalance = store.balances.get()!.ethBalance.toNumber();

    let valid = true;
    let error = "";
    if (amountETH > ethBalance) {
      valid = false;
      error = `You can lock up to ${ethBalance.toFixed(4)} ETH`;
    } else if (!amountETH || amountETH < 0) {
      valid = false;
    }

    return (
      <>
        <div style={{ flex: 1 }}>
          <Header>Lock</Header>
          <div style={{ marginTop: 20 }}>
            <Input
              unit={"ETH"}
              value={this.state.amountETH}
              onChange={this.handleChange}
            />
          </div>
          Locked: {ethLocked.toFixed(4)} ETH
          {!valid &&
            error && (
              <Message visible error>
                {error}
              </Message>
            )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button red onClick={this.props.onRequestClose}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={this.lockETH}>
            Deposit
          </Button>
        </div>
      </>
    );
  }

  lockETH = async () => {
    this.setState({ locking: true });
    await this.props.store!.lockETH(
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
    this.setState({ amountETH: value });
  };
}

export default inject("store")(observer(Lock));
