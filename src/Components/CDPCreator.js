import React, { Component } from "react";
import { Button, Modal, Header, Form } from "semantic-ui-react";

export default class CDPCreator extends Component {
  state = {
    amountETH: "",
    amountDAI: ""
  };

  render() {
    const { amountETH, amountDAI } = this.state;
    const valid = !!amountETH && !!amountDAI;

    return (
      <Modal open>
        <Header>Open a New CDP</Header>
        <Modal.Content>
          <Form>
            <Form.Input
              name={"amountETH"}
              placeholder="ETH to lock up"
              value={this.state.amountETH}
              onChange={this.handleChange}
            />
            <Form.Input
              name={"amountDAI"}
              placeholder="DAI to draw"
              value={this.state.amountDAI}
              onChange={this.handleChange}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary disabled={!valid} onClick={this.createCDP}>
            CreateCDP
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
    this.setState({ [name]: value });
  };
}
