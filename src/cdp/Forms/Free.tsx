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
}

export class Free extends Component<Props, State> {
  state: State = {
    amountETH: "0"
  };

  render() {
    const { cdp } = this.props;
    const store = this.props.store!;
    const amountETH = parseInputFloat(this.state.amountETH);
    const ethPrice = store.prices.get()!.ethPrice.toNumber();
    const wethToPeth = store.prices.get()!.wethToPeth;
    const amountPETH = amountETH / wethToPeth;
    const DAICollateralAfterFree =
      (cdp.pethLocked.get().toNumber() - amountPETH) * wethToPeth * ethPrice;
    const maxDrawnDAIAfterFree =
      DAICollateralAfterFree / store.mkrSettings.get()!.liquidationRatio;
    const minPETHCollateral =
      (cdp.daiDebt.get().toNumber() / ethPrice / wethToPeth) *
      store.mkrSettings.get()!.liquidationRatio;
    const freeablePETH = cdp.pethLocked.get().toNumber() - minPETHCollateral;
    let valid = true;
    let error = "";

    if (amountPETH > cdp.pethLocked.get().toNumber()) {
      valid = false;
      error = "CDP has less PETH locked than selected";
    } else if (maxDrawnDAIAfterFree < cdp.daiDebt.get().toNumber()) {
      valid = false;
      error = `CDP will become unsafe. You can free at most ${freeablePETH.toFixed(
        4
      )} PETH`;
    } else if (amountPETH <= 0 || this.state.amountETH === "") {
      valid = false;
    }

    return (
      <>
        <div style={{ flex: 1 }}>
          <Header>Withdraw</Header>
          <div style={{ marginTop: 20 }}>
            <Input
              unit={"ETH"}
              value={this.state.amountETH}
              onChange={this.handleChange}
            />
          </div>
          Locked: {cdp.ethLocked.get().toFixed(4)} ETH
          {!valid && error && <Message>{error}</Message>}
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
            onClick={this.freePETH}
          >
            Withdraw
          </Button>
        </div>
      </>
    );
  }

  freePETH = async () => {
    await this.props.store!.freeETH(
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

export default inject("store")(observer(Free));
