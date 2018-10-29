import React, { Component } from "react";
import { Button, Modal, Header, Form, Input, Message } from "semantic-ui-react";
import { observer } from "mobx-react";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store, CDP } from "../../store";

interface Props {
  store: Store;
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
    const amountPETH = parseInputFloat(this.state.amountPETH);
    const ethPrice = this.props.store.ethPrice.get()!.toNumber();
    const wethToPeth = this.props.store.wethToPeth.get()!;
    const amountETH = amountPETH * wethToPeth;
    const DAICollateralAfterFree =
      (this.props.cdp.pethLocked.toNumber() - amountPETH) *
      wethToPeth *
      ethPrice;
    const maxDrawnDAIAfterFree =
      DAICollateralAfterFree / this.props.store.liquidationRatio.get()!;
    const minPETHCollateral =
      (this.props.cdp.daiDebt.toNumber() / ethPrice / wethToPeth) *
      this.props.store.liquidationRatio.get()!;
    const freeablePETH =
      this.props.cdp.pethLocked.toNumber() - minPETHCollateral;
    let valid = true;
    let error = "";

    if (amountPETH > this.props.cdp.pethLocked.toNumber()) {
      valid = false;
      error = "CDP has less PETH locked than selected";
    } else if (maxDrawnDAIAfterFree < this.props.cdp.daiDebt.toNumber()) {
      valid = false;
      error = `CDP will become unsafe. You can free at most ${freeablePETH.toFixed(
        4
      )} PETH`;
    } else if (amountPETH <= 0 || this.state.amountPETH === "") {
      valid = false;
    }

    return (
      <Modal open closeIcon onClose={this.props.onRequestClose}>
        <Header>Free PETH</Header>
        <Header
          as="h5"
          style={{
            color: "gray",
            display: "inline",
            paddingBottom: "0"
          }}
        >
          Locked: {this.props.cdp.pethLocked.toNumber().toFixed(4)} PETH (
          {(this.props.cdp.pethLocked.toNumber() * wethToPeth).toFixed(4)} ETH)
        </Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>PETH to free</label>
              <Input
                name={"amountPETH"}
                label={{ basic: true, content: `${amountETH.toFixed(4)} ETH` }}
                labelPosition={"right"}
                placeholder="PETH to free"
                value={this.state.amountPETH}
                onChange={this.handleChange}
              />
            </Form.Field>
            {!valid &&
              error && (
                <Message visible error>
                  {error}
                </Message>
              )}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            loading={this.state.freeing}
            disabled={!valid}
            onClick={this.freePETH}
          >
            Free PETH
          </Button>
          <Button color="red" onClick={this.props.onRequestClose}>
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  freePETH = async () => {
    this.setState({ freeing: true });
    await this.props.store.freePETH(
      parseInputFloat(this.state.amountPETH),
      this.props.cdp
    );
    this.props.onRequestClose();
  };

  handleChange = (_e: any, { value }: { value: string }) => {
    if (!isValidFloatInputNumber(value)) {
      return;
    }
    this.setState({ amountPETH: value });
  };
}

export default observer(Free);
