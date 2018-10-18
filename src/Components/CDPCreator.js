import React, { Component } from "react";
import { Button, Modal, Header, Form } from "semantic-ui-react";
import { runInThisContext } from "vm";

export default class CDPCreator extends Component {
  state = {
    amountETH: "",
    amountDAI: "",
    collateralization: null,
    liquidation: null,
    color: 'gray',
    valid: false
  };

  render() {
    return (
      <Modal open>
        <Header>Open a New CDP</Header>
        <Header as="h5" style={{ color: this.state.color, display: "inline", paddingBottom: 0 }}>
          Collateralization: {this.state.collateralization}%
        </Header>
        <Header as="h5" style={{ color: this.state.color, display: "inline", paddingBottom: 0 }}>
          Liquidation Price: ${this.state.liquidation}
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
          <Button primary disabled={!this.state.valid} onClick={this.createCDP}>
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
    this.setState({ [name]: value }, () => {
      const ethPrice = parseFloat(this.state.amountETH) * parseFloat(this.props.store.ethPrice.get().toNumber());
      const collateralization = (ethPrice && this.state.amountDAI) ?
        ((parseFloat(ethPrice / this.state.amountDAI)) * 100).toFixed(2)
        : 0;
      const liquidation = (ethPrice && this.state.amountDAI) ?
        ((parseFloat(this.state.amountDAI) * this.props.store.liquidationRatio.get()) / (parseFloat(this.state.amountETH))).toFixed(2)
        : null;
      this.setState({ collateralization: collateralization });
      this.setState({ liquidation: liquidation });

      if (this.state.amountETH && this.state.amountDAI && collateralization < 150) {
        this.setState({ color: 'red' });
        this.setState({ valid: false });
      }
      else if (this.state.amountETH && this.state.amountDAI && collateralization >= 150) {
        this.setState({ color: 'gray' });
        this.setState({ valid: true });
      }
      else {
        this.setState({ color: 'gray' });
        this.setState({ valid: false });
      }
    });
  };
}
