import React, { Component } from "react";
import { Button, Modal, Header, Form } from "semantic-ui-react";

export default class Lock extends Component {
  state = {
    amountETH: this.props.store.ethBalance.get().toNumber(),
    amountPETH: (
      this.props.store.ethBalance.get().toNumber() /
      this.props.store.wethToPeth.get()
    ).toFixed(6),
    color: "gray",
    valid: false
  };

  render() {
    return (
      <Modal open closeIcon onClose={this.props.onRequestClose}>
        <Header>Lock ETH</Header>
        <Header
          as="h5"
          style={{
            color: this.state.color,
            display: "inline",
            paddingBottom: "0"
          }}
        >
          PETH Locked: {this.props.cdp.pethLocked.toString(4)}
        </Header>

        <Header
          as="h5"
          style={{
            color: this.state.color,
            display: "inline",
            paddingBottom: "0"
          }}
        >
          ETH -> PETH: {this.state.amountPETH}
        </Header>
        <Modal.Content>
          <Form>
            <Form.Input
              name={"amountETH"}
              label={"ETH to lock"}
              placeholder="ETH to lock"
              type="number"
              step="0.0001"
              value={this.state.amountETH}
              onChange={this.handleChange}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            disabled={!this.state.amountETH}
            onClick={this.lockETH}
          >
            Lock ETH
          </Button>
          <Button color="red" onClick={this.props.onRequestClose}>
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  lockETH = async () => {
    await this.props.store.lockETH(this.state.amountETH, this.props.cdp);
    this.props.onRequestClose();
  };

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value }, () => {
      const amountPETH = (
        this.state.amountETH / this.props.store.wethToPeth.get()
      ).toFixed(6);
      this.setState({ amountPETH: amountPETH });
    });
  };
}
