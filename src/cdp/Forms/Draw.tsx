import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Button, Input, Header } from "../../ui";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store } from "../../store";
import CDP from "../../store/cdp";
import { MaxHint, Label, LiquidationPrice } from "./common";

interface Props {
  cdp: CDP;
  store?: Store;

  onRequestClose: () => void;
}

interface State {
  amountDAI: string;
  drawing: boolean;
}

export class Draw extends Component<Props, State> {
  state: State = {
    // FIXME dont use a constant here
    amountDAI:
      this.props.cdp.daiLocked.get() / 2 -
        this.props.cdp.daiDebt.get().toNumber() >
      0
        ? "" +
          (this.props.cdp.daiLocked.get() / 2 -
            this.props.cdp.daiDebt.get().toNumber())
        : "",
    drawing: false
  };

  render() {
    let valid = true;
    let inputValid = true;
    const amountDAI = parseInputFloat(this.state.amountDAI);
    if (this.props.cdp.daiAvailable.get() < amountDAI) {
      inputValid = false;
      valid = false;
    } else if (amountDAI < 0 || !this.state.amountDAI) {
      valid = false;
    }

    return (
      <>
        <div style={{ flex: 1 }}>
          <Header>Generate</Header>
          <Input
            unit={"DAI"}
            value={this.state.amountDAI}
            onChange={this.handleChange}
            error={!inputValid}
          >
            <MaxHint
              value={this.props.cdp.daiAvailable.get()}
              onChange={(amountDAI: string) => this.setState({ amountDAI })}
            />
          </Input>
          <Label>DAI Debt</Label>
          {this.props.cdp.daiDebt.get().toString()}
          <LiquidationPrice cdp={this.props.cdp} />
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
            onClick={this.drawDAI}
          >
            Generate
          </Button>
        </div>
      </>
    );
  }

  drawDAI = async () => {
    this.setState({ drawing: true });
    await this.props.store!.drawDAI(
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

export default inject("store")(observer(Draw));
