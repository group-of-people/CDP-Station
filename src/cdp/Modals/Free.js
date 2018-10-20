import React, { Component } from "react";
import { Button, Modal, Header, Form, Input } from "semantic-ui-react";
import { observer } from "mobx-react";

export class Free extends Component {
  state = {
    amountPETH: 0
  };

  render() {
    const amountETH = (
      this.state.amountPETH * this.props.store.wethToPeth.get()
    ).toFixed(4);
    let valid = true;
    if (this.state.amountPETH > this.props.cdp.pethLocked) {
      valid = false;
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
                label={{ basic: true, content: `${amountETH} ETH` }}
                labelPosition={"right"}
                placeholder="PETH to free"
                type="number"
                value={this.state.amountPETH}
                onChange={this.handleChange}
              />
            </Form.Field>
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
