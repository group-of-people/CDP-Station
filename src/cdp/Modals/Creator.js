import React, { Component } from "react";
import { Button, Modal, Header, Form } from "semantic-ui-react";
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
    let color;
    let valid = false;
    if (
      this.EthToLock.get() &&
      this.DaiToDraw.get() &&
      this.collateralization.get() < 150
    ) {
      color = "red";
      valid = false;
    } else if (
      this.EthToLock.get() &&
      this.DaiToDraw.get() &&
      this.collateralization.get() >= 150
    ) {
      color = "gray";
      valid = true;
    } else {
      color = "gray";
      valid = false;
    }

    return (
      <Modal open onClose={this.props.onRequestClose}>
        <Header>Open a New CDP</Header>
        <Header
          as="h5"
          style={{
            color: color,
            display: "inline",
            paddingBottom: 0
          }}
        >
          Collateralization: {this.collateralization.get()}%
        </Header>
        <Header
          as="h5"
          style={{
            color: color,
            display: "inline",
            paddingBottom: 0
          }}
        >
          Liquidation Price: ${this.liquidation.get()}
        </Header>
        <Header
          as="h5"
          style={{
            color: color,
            display: "inline",
            paddingBottom: 0
          }}
        >
          Collateral Price: ${this.daiTotal.get().toFixed(2)}
        </Header>
        <Modal.Content>
          <Form>
            <Form.Input
              name={"EthToLock"}
              placeholder="ETH to lock up"
              type="number"
              step="0.001"
              value={this.EthToLock.get()}
              onChange={this.handleChange}
            />
            <Form.Input
              name={"DaiToDraw"}
              placeholder="DAI to draw"
              type="number"
              step="0.01"
              value={this.DaiToDraw.get()}
              onChange={this.handleChange}
            />
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
    this[name].set(value)
  };
}

export default observer(CDPCreator);
