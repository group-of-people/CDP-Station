import React, { Component } from "react";
import { Button, Input, Message, Header, Loader } from "../../ui";
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
  creating: boolean | null;
}

export class CDPCreator extends Component<Props, State> {
  state: State = {
    creating: null
  };
  EthToLock = observable.box(
    (
      Math.floor(
        this.props.store!.balances.get()!.ethBalance.toNumber() * 100
      ) / 100
    ).toFixed(2)
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
      <>
        {!!this.state.creating ? (
          this.renderLoading()
        ) : (
          <>
            <div style={{ flex: 1 }}>
              <Header>Open a New CDP</Header>
              <Input
                label={"ETH to lock up"}
                unit={"ETH"}
                value={this.EthToLock.get()}
                onChange={this.handleEthChange}
              />
              <Input
                label={"DAI to draw"}
                unit={"DAI"}
                value={this.DaiToDraw.get()}
                onChange={this.handleDaiChange}
              />
              {!valid &&
                error && (
                  <Message visible error>
                    {error}
                  </Message>
                )}
              {!!this.DaiToDraw.get() && (
                <div
                  style={{
                    display: "inline",
                    marginRight: "3%"
                  }}
                >
                  Liquidation Price: ${this.cdp.liquidationPrice.get()}
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button red onClick={this.props.onRequestClose}>
                Cancel
              </Button>
              <Button disabled={!valid} onClick={this.createCDP}>
                CreateCDP
              </Button>
            </div>
          </>
        )}
      </>
    );
  }

  createCDP = async () => {
    this.setState({ creating: true });
    try {
      await this.props.store!.createCDP(
        parseInputFloat(this.EthToLock.get()),
        parseInputFloat(this.DaiToDraw.get())
      );
    } catch (e) {
      console.log(e);
    }
    this.setState({ creating: false });
    this.props.onRequestClose();
  };

  handleEthChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (!isValidFloatInputNumber(value)) {
      return;
    }
    this.EthToLock.set(value);
  };

  handleDaiChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    if (!isValidFloatInputNumber(value)) {
      return;
    }
    this.DaiToDraw.set(value);
  };

  renderLoading = () => {
    return <Loader color={"#90A4AE"} />;
  };
}

export default inject("store")(observer(CDPCreator));
