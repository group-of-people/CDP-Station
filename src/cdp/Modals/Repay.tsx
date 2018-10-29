import React, { Component } from "react";
import { Button, Modal, Header, Form } from "semantic-ui-react";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store, CDP } from "../../store";

interface Props {
  store: Store;
  cdp: CDP;

  onRequestClose: () => void;
}

interface State {
  amountDAI: string;
  repaying: boolean;
}

export default class Repay extends Component<Props, State> {
  state: State = {
    amountDAI: Math.min(
      this.props.store.daiBalance.get()!.toNumber(),
      this.props.cdp.daiDebt.toNumber()
    ).toString(),
    repaying: false
  };

  render() {
    const amountDAI = parseInputFloat(this.state.amountDAI);
    let valid = false;
    if (amountDAI > 0 && this.props.cdp.daiDebt.toNumber() >= amountDAI) {
      valid = true;
    }

    return (
      <Modal open closeIcon onClose={this.props.onRequestClose}>
        <Header>Repay (requires MKR)</Header>
        <Header
          as="h5"
          style={{
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
          MKR Balance: {this.props.store.mkrBalance.get()!.toString(4)}
        </Header>
        <Modal.Content>
          <Form>
            <Form.Input
              name={"amountDAI"}
              label={"DAI to repay"}
              placeholder="DAI to repay"
              value={this.state.amountDAI}
              onChange={this.handleChange}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            loading={this.state.repaying}
            disabled={!valid}
            onClick={this.repayDAI}
          >
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
    this.setState({ repaying: true });
    await this.props.store.repayDAI(
      parseInputFloat(this.state.amountDAI),
      this.props.cdp
    );
    this.props.onRequestClose();
  };

  handleChange = (_e: any, { value }: { value: string }) => {
    if (!isValidFloatInputNumber(value)) {
      return;
    }
    this.setState({ amountDAI: value });
  };
}
