import React, { Component } from "react";
import { Button, Modal, Header, Form, Input, Message } from "semantic-ui-react";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";

export default class Lock extends Component {
  state = {
    amountETH: this.props.store.ethBalance.get().toNumber()
  };

  render() {
    const amountETH = parseInputFloat(this.state.amountETH);

    const wethToPeth = this.props.store.wethToPeth.get();
    const amountPETH = (amountETH / wethToPeth).toFixed(4);

    const pethLocked = this.props.cdp.pethLocked;
    const ethLocked = pethLocked.toNumber() * wethToPeth;

    const ethBalance = this.props.store.ethBalance.get().toNumber();

    let valid = true;
    let error = "";
    if (amountETH > ethBalance) {
      valid = false;
      error = `You can lock up to ${ethBalance.toFixed(4)} ETH`;
    } else if (!amountETH || amountETH < 0) {
      valid = false;
    }

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
                value={this.state.amountETH}
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
            loading={this.state.locking}
            disabled={!valid}
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
    this.setState({ locking: true });
    await this.props.store.lockETH(this.state.amountETH, this.props.cdp);
    this.props.onRequestClose();
  };

  handleChange = (e, { name, value }) => {
    if (!isValidFloatInputNumber(value)) {
      return;
    }
    this.setState({ [name]: value });
  };
}
