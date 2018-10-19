import React, { Component } from "react";
import { Button, Modal, Header, Form } from "semantic-ui-react";

export default class Draw extends Component {
  state = {
    amountDAI: "",
    color: "gray",
    valid: false
  };

  render() {
    return (
      <Modal open>
        <Header>Draw DAI</Header>
        <Header
          as="h5"
          style={{
            color: this.state.color,
            display: "inline",
            paddingBottom: "0"
          }}
        >
          DAI Available: {this.props.cdp.daiAvailable.toString()}
        </Header>
        <Modal.Content>
          <Form>
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
          <Button primary disabled={!this.state.valid} onClick={this.drawDAI}>
            Draw DAI
          </Button>
          <Button color="red" onClick={this.props.onRequestClose}>
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  drawDAI = async () => {
    await this.props.store.drawDAI(this.state.amountDAI, this.props.cdp);
    this.props.onRequestClose();
  };

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value }, () => {
      if (
        this.state.amountDAI &&
        this.props.cdp.daiAvailable >= this.state.amountDAI
      ) {
        this.setState({ valid: true });
      } else {
        this.setState({ valid: false });
      }
    });
  };
}
