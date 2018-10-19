import React, { Component } from "react";
import { Button, Modal, Header, Form } from "semantic-ui-react";
import { runInThisContext } from "vm";

export default class Free extends Component {
  state = {
    amountPETH: "",
    color: "gray",
    valid: false
  };

  render() {
    return (
      <Modal open>
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
            <Form.Input
              name={"amountPETH"}
              placeholder="PETH to free"
              type="number"
              step="0.0001"
              value={this.state.PETH}
              onChange={this.handleChange}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary disabled={this.state.valid} onClick={this.freePETH}>
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
    this.setState({ [name]: value }, () => {

    });
  };
}
