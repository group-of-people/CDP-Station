import React, { Component } from "react";
import { Button, Modal, Header, Form, Input } from "semantic-ui-react";

export default class Lock extends Component {
  state = {
    amountETH: this.props.store.ethBalance.get().toNumber(),
    color: "gray",
    valid: false
  };

  render() {
    const wethToPeth = this.props.store.wethToPeth.get();
    const amountPETH = (this.state.amountETH / wethToPeth).toFixed(4);

    const pethLocked = this.props.cdp.pethLocked;
    const ethLocked = pethLocked.toNumber() * wethToPeth;

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
          Locked: {pethLocked.toString(4)} ({ethLocked.toFixed(4)} ETH)
        </Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>ETH to lock</label>
              <Input
                name={"amountETH"}
                label={{ basic: true, content: `${amountPETH} PETH` }}
                labelPosition={"right"}
                placeholder="ETH to lock"
                type="number"
                step="0.0001"
                value={this.state.amountETH}
                onChange={this.handleChange}
              />
            </Form.Field>
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
    this.setState({ [name]: value });
  };
}
