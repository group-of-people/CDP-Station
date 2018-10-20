import React, { Component } from "react";
import { Button, Modal, Header, Form, Input, Message } from "semantic-ui-react";
import { observer } from "mobx-react";

export class Free extends Component {
  state = {
    amountPETH: 0
  };

  render() {
    const ethPrice = this.props.store.ethPrice.get().toNumber();
    const wethToPeth = this.props.store.wethToPeth.get();
    const amountETH = this.state.amountPETH * wethToPeth;
    const DAICollateralAfterFree =
      (this.props.cdp.pethLocked.toNumber() - this.state.amountPETH) *
      wethToPeth *
      ethPrice;
    const maxDrawnDAIAfterFree =
      DAICollateralAfterFree / this.props.store.liquidationRatio.get();
    const minPETHCollateral = this.props.cdp.daiDebt.toNumber() / ethPrice / wethToPeth;
    const freeablePETH = this.props.cdp.pethLocked.toNumber() - minPETHCollateral;
    let valid = true;
    let error = "";

    if (this.state.amountPETH > this.props.cdp.pethLocked.toNumber()) {
      valid = false;
      error = "CDP has less PETH locked than selected";
    }

    if (maxDrawnDAIAfterFree < this.props.cdp.daiDebt.toNumber()) {
      valid = false;
      error = `CDP will become unsafe. You can free at most ${freeablePETH.toFixed(
        4
      )} PETH`;
    }

    return (
      <Modal open closeIcon onClose={this.props.onRequestClose}>
        <Header>Free PETH</Header>
        <Header
          as="h5"
          style={{
            color: this.state.color,
            display: "inline",
            paddingBottom: "0"
          }}
        >
          PETH Locked: {this.props.cdp.pethLocked.toString(6)}
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
                type="number"
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
          <Button primary disabled={!valid} onClick={this.freePETH}>
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
    await this.props.store.freePETH(this.state.amountPETH, this.props.cdp);
    this.props.onRequestClose();
  };

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };
}

export default observer(Free);
