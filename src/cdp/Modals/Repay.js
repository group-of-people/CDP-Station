import React, { Component } from "react";
import { Button, Modal, Header, Form } from "semantic-ui-react";

export default class Repay extends Component {
  state = {
    amountDAI: "",
    color: "gray",
    valid: false
  };

  render() {
    return (
      <Modal open closeIcon onClose={this.props.onRequestClose}>
        <Header>Repay (requires MKR)</Header>
        <Header
          as="h5"
          style={{
            color: this.state.color,
            display: "inline",
            paddingBottom: "0"
          }}
        >
          DAI Debt: {this.props.cdp.daiDebt.toString()}
        </Header>
        {/* <Header as="h5" style={{ color: "gray", display: "inline", paddingBottom: '0' }}>
                    Governance Fee: {this.props.cdp.governanceFee.toString()}
                </Header> */}
        <Header
          as="h5"
          style={{ color: "gray", display: "inline", paddingBottom: "0" }}
        >
          MKR Balance: {this.props.store.mkrBalance.get().toString()}
        </Header>
        <Modal.Content>
          <Form>
            <Form.Input
              name={"amountDAI"}
              placeholder="DAI to repay"
              type="number"
              step="0.01"
              value={this.state.amountDAI}
              onChange={this.handleChange}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary disabled={!this.state.valid} onClick={this.repayDAI}>
            Repay DAI
          </Button>
          <Button color="red" onClick={this.props.onRequestClose}>
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  repayDAI = async () => {
    await this.props.store.repayDAI(this.state.amountDAI, this.props.cdp);
    this.props.onRequestClose();
  };

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value }, () => {
      //const collateralization =
      if (
        this.state.amountDAI &&
        this.props.cdp.daiDebt >= this.state.amountDAI
      ) {
        this.setState({ valid: true });
      } else {
        this.setState({ valid: false });
      }
    });
  };
}
