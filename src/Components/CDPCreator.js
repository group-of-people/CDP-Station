import React, { Component } from "react";
import CDPCreatorBuild from "../utils/CDPCreator.json";
import { Input, Button, Modal, Header } from "semantic-ui-react";

export default class CDPCreator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contract: null,
      amountETH: null,
      amountDAI: null
    };

    this.handleETHChange = this.handleETHChange.bind(this);
    this.handleDAIChange = this.handleDAIChange.bind(this);
    this.createCDP = this.createCDP.bind(this);
  }

  componentDidMount() {
    this.instantiateContract();
  }
  render() {
    return (
      <Modal open>
        <Header>Open a New CDP</Header>
        <Modal.Content>
          <Input onChange={this.handleETHChange} placeholder="ETH to lock up" />
          <Input onChange={this.handleDAIChange} placeholder="DAI to draw" />
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.createCDP}>
            CreateCDP
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  instantiateContract() {
    this.setState({
      contract: new this.props.web3.eth.Contract(
        CDPCreatorBuild.abi,
        "0x940bF0EE39db2F9b2f85059725216e3898372222"
      )
    });
  }

  async createCDP() {
    const eth = this.props.web3.utils.toWei(
      this.state.amountETH.toString(),
      "ether"
    );
    const dai = (this.state.amountDAI * Math.pow(10, 18)).toString();
    await this.state.contract.methods
      .createCDP(eth, dai)
      .send({ from: this.props.address, value: eth });
    this.props.onRequestClose();
  }

  handleETHChange(e) {
    this.setState({ amountETH: e.target.value });
  }

  handleDAIChange(e) {
    this.setState({ amountDAI: e.target.value });
  }
}
