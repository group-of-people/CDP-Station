import React, { Component } from "react";
import { Button, Modal, Header, Form } from "semantic-ui-react";
import { observer } from "mobx-react";

export class CDPCreator extends Component {
  state = {
    amountETH: "",
    amountDAI: "",
  };

  render() {
    const ethPrice =
      parseFloat(this.state.amountETH) *
      parseFloat(this.props.store.ethPrice.get().toNumber());
    const collateralization =
      ethPrice && this.state.amountDAI
        ? (parseFloat(ethPrice / this.state.amountDAI) * 100).toFixed(2)
        : 0;
    const liquidation =
      ethPrice && this.state.amountDAI
        ? (
            (parseFloat(this.state.amountDAI) *
              this.props.store.liquidationRatio.get()) /
            parseFloat(this.state.amountETH)
          ).toFixed(2)
        : null;

    let color;
    let valid = false;
    if (
      this.state.amountETH &&
      this.state.amountDAI &&
      collateralization < 150
    ) {
      color = "red";
      valid = false;
    } else if (
      this.state.amountETH &&
      this.state.amountDAI &&
      collateralization >= 150
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
          Collateralization: {collateralization}%
        </Header>
        <Header
          as="h5"
          style={{
            color: color,
            display: "inline",
            paddingBottom: 0
          }}
        >
          Liquidation Price: ${liquidation}
        </Header>
        <Modal.Content>
          <Form>
            <Form.Input
              name={"amountETH"}
              placeholder="ETH to lock up"
              type="number"
              step="0.001"
              value={this.state.amountETH}
              onChange={this.handleChange}
            />
            <Form.Input
              name={"amountDAI"}
              placeholder="DAI to draw"
              type="number"
              step="0.01"
              value={this.state.amountDAI}
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
      this.state.amountETH,
      this.state.amountDAI
    );
    this.props.onRequestClose();
  };

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value }, () => {});
  };
}

export default observer(CDPCreator);
