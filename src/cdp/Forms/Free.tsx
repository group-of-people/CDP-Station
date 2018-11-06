import React, { Component } from "react";
import { Button, Form, Input, Message } from "../../ui";
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
  amountPETH: string;
  freeing: boolean;
}

export class Free extends Component<Props, State> {
  state: State = {
    amountPETH: "0",
    freeing: false
  };

  render() {
    const { cdp } = this.props;
    const store = this.props.store!;
    const amountPETH = parseInputFloat(this.state.amountPETH);
    const ethPrice = store.prices.get()!.ethPrice.toNumber();
    const wethToPeth = store.prices.get()!.wethToPeth;
    const amountETH = amountPETH * wethToPeth;
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
    } else if (amountPETH <= 0 || this.state.amountPETH === "") {
      valid = false;
    }

    return (
      <div>
        Free PETH <br />
        Locked:{" "}
        {cdp.pethLocked
          .get()
          .toNumber()
          .toFixed(4)}{" "}
        PETH ({cdp.ethLocked.get().toFixed(4)} ETH)
        <Input
          label={"PETH to free"}
          previewContent={`${amountETH.toFixed(4)} ETH`}
          value={this.state.amountPETH}
          onChange={this.handleChange}
        />
        {!valid &&
          error && (
            <Message visible error>
              {error}
            </Message>
          )}
        <Button disabled={!valid} onClick={this.freePETH}>
          Free PETH
        </Button>
        <Button red onClick={this.props.onRequestClose}>
          Cancel
        </Button>
      </div>
    );
  }

  freePETH = async () => {
    this.setState({ freeing: true });
    await this.props.store!.freePETH(
      parseInputFloat(this.state.amountPETH),
      this.props.cdp
    );
    this.props.onRequestClose();
  };

  handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (!isValidFloatInputNumber(value)) {
      return;
    }
    this.setState({ amountPETH: value });
  };
}

export default inject("store")(observer(Free));
