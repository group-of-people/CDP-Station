import React, { Component } from "react";
import { Button, Modal, Header, Form, Message } from "semantic-ui-react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";

export class CDPCreator extends Component {
  EthToLock = observable.box(this.props.store.ethBalance.get().toNumber());
  DaiToDraw = observable.box(0);

  daiTotal = computed(
    () =>
      parseFloat(this.EthToLock.get()) *
      this.props.store.ethPrice.get().toNumber()
  );
  collateralization = computed(
    () =>
      this.daiTotal.get() && this.DaiToDraw.get()
        ? (
            parseFloat(this.daiTotal.get() / this.DaiToDraw.get()) * 100
          ).toFixed(2)
        : 0
  );
  liquidation = computed(
    () =>
      this.daiTotal.get() && this.DaiToDraw.get()
        ? (
            (parseFloat(this.DaiToDraw.get()) *
              this.props.store.liquidationRatio.get()) /
            parseFloat(this.EthToLock.get())
          ).toFixed(2)
        : null
  );

  render() {
    const minCollateralization = this.props.store.liquidationRatio.get() * 100;
    let valid = false;
    let error = "";
    if (
      this.EthToLock.get() &&
      this.DaiToDraw.get() &&
      this.collateralization.get() < minCollateralization
    ) {
      error = `Collateralization < ${minCollateralization}%. You can draw up to ${(
        this.daiTotal.get() / this.props.store.liquidationRatio.get()
      ).toFixed(2)} DAI.`;
      valid = false;
    } else if (this.EthToLock.get()) {
      valid = true;
    }

    return (
      <Modal open onClose={this.props.onRequestClose}>
        <Header>Open a New CDP</Header>
        {!!this.DaiToDraw.get() && (
          <div
            style={{
              display: "inline",
              marginLeft: "3%",
              marginRight: "3%"
            }}
          >
            Collateralization: {this.collateralization.get()}%
          </div>
        )}
        {!!this.DaiToDraw.get() && (
          <div
            style={{
              display: "inline",
              marginRight: "3%"
            }}
          >
            Liquidation Price: ${this.liquidation.get()}
          </div>
        )}
        <Modal.Content>
          <Form>
            <Form.Input
              name={"EthToLock"}
              label={"ETH to lock up"}
              placeholder="ETH to lock up"
              type="number"
              step="0.001"
              value={this.EthToLock.get()}
              onChange={this.handleChange}
            />
            <Form.Input
              name={"DaiToDraw"}
              label={"DAI to draw"}
              placeholder="DAI to draw"
              type="number"
              step="0.01"
              value={this.DaiToDraw.get().toString()}
              onChange={this.handleChange}
            />
            {!valid &&
              error && (
                <Message visible error>
                  {error}
                </Message>
              )}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary disabled={!valid} onClick={this.createCDP}>
            CreateCDP
          </Button>
          <Button color="red" onClick={this.props.onRequestClose}>
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  createCDP = async () => {
    await this.props.store.createCDP(
      this.EthToLock.get(),
      this.DaiToDraw.get()
    );
    this.props.onRequestClose();
  };

  handleChange = (e, { name, value }) => {
    this[name].set(parseFloat(value) || 0);
  };
}

export default observer(CDPCreator);
