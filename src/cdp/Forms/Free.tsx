import React, { Component } from "react";
import { Button, Input, Header } from "../../ui";
import { inject, observer } from "mobx-react";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store } from "../../store";
import CDP from "../../store/cdp";
import { MaxHint, Label, LiquidationPrice } from "./common";

interface Props {
  store?: Store;
  cdp: CDP;
  previewCdp: CDP;

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
      (cdp.pethLocked.get() - amountPETH) * wethToPeth * ethPrice;
    const maxDrawnDAIAfterFree =
      DAICollateralAfterFree / store.mkrSettings.get()!.liquidationRatio;
    const minPETHCollateral =
      (cdp.daiDebt.get() / ethPrice / wethToPeth) *
      store.mkrSettings.get()!.liquidationRatio;
    const freeablePETH = cdp.pethLocked.get() - minPETHCollateral;

    let valid = true;
    let inputValid = true;
    if (amountPETH > cdp.pethLocked.get()) {
      valid = false;
      inputValid = false;
      // error = "CDP has less PETH locked than selected";
    } else if (maxDrawnDAIAfterFree < cdp.daiDebt.get()) {
      valid = false;
      inputValid = false;
      // error = `CDP will become unsafe. You can free at most ${freeablePETH.toFixed(
      //   4
      // )} PETH`;
    } else if (amountPETH <= 0 || this.state.amountETH === "") {
      valid = false;
    }

    return (
      <>
        <div style={{ flex: 1 }}>
          <Header>Withdraw</Header>
          <Input
            unit={"ETH"}
            value={this.state.amountETH}
            onChange={this.handleChange}
            error={!inputValid}
          >
            <MaxHint
              value={freeablePETH * wethToPeth}
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
            onClick={this.freeETH}
          >
            Withdraw
          </Button>
        </div>
      </>
    );
  }

  freeETH = () => {
    this.props.store!.freeETH(
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
        Math.max(0, this.props.cdp.ethLocked.get() - parseInputFloat(value)) *
          10 ** 18,
        this.props.previewCdp.daiDebt.get()
      );
    });
  };
}

export default inject("store")(observer(Free));
