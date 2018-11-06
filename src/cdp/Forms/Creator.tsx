import React, { Component } from "react";
import { Button, Form, Message } from "../../ui";
import { inject, observer } from "mobx-react";
import { observable, autorun, IObservableValue } from "mobx";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store } from "../../store";
import CDP from "../../store/cdp";
import MkrSettings from "../../store/mkrSettings";
import Prices from "../../store/prices";

interface Props {
  store?: Store;

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
    this.props
      .store!.balances.get()!
      .ethBalance.toNumber()
      .toString()
  );
  DaiToDraw = observable.box("0");
  cdp = new CDP(
    -1,
    0,
    0,
    this.props.store!.prices as IObservableValue<Prices>,
    this.props.store!.mkrSettings as IObservableValue<MkrSettings>
  );
  dispose = () => {};

  componentDidMount() {
    this.dispose = autorun(() => {
      this.cdp.update(
        parseInputFloat(this.EthToLock.get()),
        parseInputFloat(this.DaiToDraw.get())
      );
    });
  }

  componentWillUnmount() {
    this.dispose();
  }

  render() {
    const { creating } = this.state;
    const store = this.props.store!;

    const minCollateralization =
      store.mkrSettings.get()!.liquidationRatio * 100;
    const ethBalance = store.balances.get()!.ethBalance.toNumber();

    let valid = false;
    let error = "";
    if (this.EthToLock.get() === "" || this.DaiToDraw.get() === "") {
      valid = false;
    } else if (this.cdp.collateralization.get() < minCollateralization) {
      error = `Collateralization < ${minCollateralization}%. You can draw up to ${(
        this.cdp.daiLocked.get() / store.mkrSettings.get()!.liquidationRatio
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
      <div />
      // <Modal open closeIcon onClose={this.props.onRequestClose}>
      //   <Header>Open a New CDP</Header>
      //   {!!this.DaiToDraw.get() && (
      //     <div
      //       style={{
      //         display: "inline",
      //         marginLeft: "3%",
      //         marginRight: "3%"
      //       }}
      //     >
      //       Collateralization: {this.cdp.collateralization.get()}%
      //     </div>
      //   )}
      //   {!!this.DaiToDraw.get() && (
      //     <div
      //       style={{
      //         display: "inline",
      //         marginRight: "3%"
      //       }}
      //     >
      //       Liquidation Price: ${this.cdp.liquidationPrice.get()}
      //     </div>
      //   )}
      //   {/* <Modal.Content>
      //     <Form>
      //       <Form.Input
      //         name={"EthToLock"}
      //         label={"ETH to lock up"}
      //         placeholder="ETH to lock up"
      //         value={this.EthToLock.get()}
      //         onChange={this.handleEthChange}
      //       />
      //       <Form.Input
      //         name={"DaiToDraw"}
      //         label={"DAI to draw"}
      //         placeholder="DAI to draw"
      //         value={this.DaiToDraw.get()}
      //         onChange={this.handleDaiChange}
      //       />
      //       {!valid &&
      //         error && (
      //           <Message visible error>
      //             {error}
      //           </Message>
      //         )}
      //     </Form>
      //   </Modal.Content>
      //   <Modal.Actions>
      //     <Button
      //       primary
      //       loading={!!creating}
      //       disabled={!valid}
      //       onClick={this.createCDP}
      //     >
      //       CreateCDP
      //     </Button>
      //     <Button color="red" onClick={this.props.onRequestClose}>
      //       Cancel
      //     </Button>
      //   </Modal.Actions> */}
      // </Modal>
    );
  }

  createCDP = async () => {
    this.setState({ creating: true });
    await this.props.store!.createCDP(
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

export default inject("store")(observer(CDPCreator));
