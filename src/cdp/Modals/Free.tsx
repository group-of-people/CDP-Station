import React, { Component } from "react";
import { Button, Modal, Header, Form, Input, Message } from "semantic-ui-react";
import { observer } from "mobx-react";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store } from "../../store";
import CDP from '../../store/cdp'

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
    const {cdp, store} = this.props
    const amountPETH = parseInputFloat(this.state.amountPETH);
    const ethPrice = store.prices.get()!.ethPrice.toNumber();
    const wethToPeth = store.prices.get()!.wethToPeth;
    const amountETH = amountPETH * wethToPeth;
    const DAICollateralAfterFree =
      (cdp.pethLocked.get().toNumber() - amountPETH) *
      wethToPeth *
      ethPrice;
    const maxDrawnDAIAfterFree =
      DAICollateralAfterFree / store.mkrSettings.get()!.liquidationRatio;
    const minPETHCollateral =
      (cdp.daiDebt.get().toNumber() / ethPrice / wethToPeth) *
      store.mkrSettings.get()!.liquidationRatio;
    const freeablePETH =
      cdp.pethLocked.get().toNumber() - minPETHCollateral;
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
          Locked: {cdp.pethLocked.get().toNumber().toFixed(4)} PETH (
          {cdp.ethLocked.get().toFixed(4)} ETH)
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
