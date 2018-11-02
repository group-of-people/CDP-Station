import React, { Component } from "react";
import { Button, Modal, Header, Form, Message } from "semantic-ui-react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store } from "../../store";

interface Props {
  store: Store;

  onRequestClose: () => void;
}

interface State {
  creating: boolean;
}

export class CDPCreator extends Component<Props, State> {
  state: State = {
    creating: false
  };
  EthToLock = observable.box(
    this.props.store.balances
      .get()!
      .ethBalance.toNumber()
      .toString()
  );
  DaiToDraw = observable.box("0");

  daiTotal = computed(
    () =>
      parseInputFloat(this.EthToLock.get()) *
      this.props.store.prices.get()!.ethPrice.toNumber()
  );
  collateralization = computed(
    () =>
      this.daiTotal.get() && this.DaiToDraw.get()
        ? (
            (this.daiTotal.get() / parseInputFloat(this.DaiToDraw.get())) *
            100
          ).toFixed(2)
        : 0
  );
  liquidation = computed(
    () =>
      this.daiTotal.get() && this.DaiToDraw.get()
        ? (
            (parseInputFloat(this.DaiToDraw.get()) *
              this.props.store.mkrSettings.get()!.liquidationRatio) /
            parseInputFloat(this.EthToLock.get())
          ).toFixed(2)
        : null
  );

  render() {
    const { creating } = this.state;
    const minCollateralization = this.props.store.mkrSettings.get()!.liquidationRatio * 100;
    const ethBalance = this.props.store.balances.get()!.ethBalance.toNumber();

    let valid = false;
    let error = "";
    if (this.EthToLock.get() === "" || this.DaiToDraw.get() === "") {
      valid = false;
    } else if (this.collateralization.get() < minCollateralization) {
      error = `Collateralization < ${minCollateralization}%. You can draw up to ${(
        this.daiTotal.get() / this.props.store.mkrSettings.get()!.liquidationRatio
      ).toFixed(2)} DAI.`;
      valid = false;
    } else if (ethBalance < parseInputFloat(this.EthToLock.get())) {
      error = `You can lock up to ${ethBalance.toFixed(4)} ETH`;
      valid = false;
    } else if (
      parseInputFloat(this.EthToLock.get()) > 0 &&
      parseInputFloat(this.DaiToDraw.get()) > 0
    ) {
      valid = true;
    }

    return (
      <Modal open closeIcon onClose={this.props.onRequestClose}>
        <Header>Open a New CDP</Header>
        {!!this.DaiToDraw.get() && (
          <div
            style={{
              display: "inline",
              marginLeft: "3%",
              marginRight: "3%"
            }}
          >
            Collateralization: {this.collateralization.get()}%
          </div>
        )}
        {!!this.DaiToDraw.get() && (
          <div
            style={{
              display: "inline",
              marginRight: "3%"
            }}
          >
            Liquidation Price: ${this.liquidation.get()}
          </div>
        )}
        <Modal.Content>
          <Form>
            <Form.Input
              name={"EthToLock"}
              label={"ETH to lock up"}
              placeholder="ETH to lock up"
              value={this.EthToLock.get()}
              onChange={this.handleEthChange}
            />
            <Form.Input
              name={"DaiToDraw"}
              label={"DAI to draw"}
              placeholder="DAI to draw"
              value={this.DaiToDraw.get()}
              onChange={this.handleDaiChange}
            />
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
            loading={!!creating}
            disabled={!valid}
            onClick={this.createCDP}
          >
            CreateCDP
          </Button>
          <Button color="red" onClick={this.props.onRequestClose}>
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  createCDP = async () => {
    this.setState({ creating: true });
    await this.props.store.createCDP(
      parseInputFloat(this.EthToLock.get()),
      parseInputFloat(this.DaiToDraw.get())
    );
    this.props.onRequestClose();
  };

  handleEthChange = (_e: any, { value }: { value: string }) => {
    if (!isValidFloatInputNumber(value)) {
      return;
    }
    this.EthToLock.set(value);
  };

  handleDaiChange = (_e: any, { value }: { value: string }) => {
    if (!isValidFloatInputNumber(value)) {
      return;
    }
    this.DaiToDraw.set(value);
  };
}

export default observer(CDPCreator);
