import React, { Component } from "react";
import CDPCreatorBuild from "../utils/CDPCreator.json";
import { Button, Modal, Header, Form } from "semantic-ui-react";

export default class CDPCreator extends Component {
  state = {
    contract: new this.props.web3.eth.Contract(
      CDPCreatorBuild.abi,
      "0x940bF0EE39db2F9b2f85059725216e3898372222"
    ),
    amountETH: null,
    amountDAI: null
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
    const eth = this.props.web3.utils.toWei(
      this.state.amountETH.toString(),
      "ether"
    );
    const dai = (this.state.amountDAI * Math.pow(10, 18)).toString();
    await this.state.contract.methods
      .createCDP(eth, dai)
      .send({ from: this.props.address, value: eth });
    this.props.onRequestClose();
  };

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };
}
