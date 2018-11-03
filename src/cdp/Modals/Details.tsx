import React, { Component } from "react";
import { Modal, Header, Button, Icon } from "semantic-ui-react";
import { observer, inject } from "mobx-react";
import { Store, MKR } from "../../store";
import CDP from "../../store/cdp";

interface Props {
  store?: Store;
  cdp: CDP;

  onRequestClose: () => void;
}

interface State {
  governanceFee: number | null;
}

export class CDPDetails extends Component<Props, State> {
  state: State = {
    governanceFee: null
  };

  componentDidMount() {
    this.props.store!.maker!.getCdp(this.props.cdp.id).then(cdp => {
      cdp.getGovernanceFee(MKR).then(fee => {
        this.setState({ governanceFee: fee.toNumber() });
      });
    });
  }

  render() {
    const { cdp } = this.props;

    return (
      <Modal open closeIcon onClose={this.props.onRequestClose}>
        <Header>CDP #{cdp.id}</Header>
        <Modal.Content>
          <ul style={{ width: "40%", display: "inline-block" }}>
            <li>CDP - {cdp.id}</li>
            <li>Debt - {cdp.daiDebt.get().toString(4)}</li>
            <li>
              DAI Available -{" "}
              {(
                cdp.daiLocked.get() /
                  this.props.store!.mkrSettings.get()!.liquidationRatio -
                cdp.daiDebt.get().toNumber()
              ).toFixed(4)}{" "}
              DAI
            </li>
            <li>Collateral ETH - {cdp.ethLocked.get().toFixed(4)} ETH</li>
            <li>Collateral DAI - {cdp.daiLocked.get().toFixed(4)} DAI</li>
            <li>
              Liquidation Price - $
              {(
                (cdp.daiDebt.get().toNumber() *
                  this.props.store!.mkrSettings.get()!.liquidationRatio) /
                cdp.ethLocked.get()
              ).toFixed(2)}
            </li>
            <li>PETH locked - {cdp.pethLocked.get().toString(4)}</li>
            <li
              title={
                this.state.governanceFee
                  ? this.state.governanceFee.toString()
                  : ""
              }
            >
              Governance Fee -{" "}
              {!!this.state.governanceFee &&
                this.state.governanceFee.toFixed(4)}{" "}
              MKR
            </li>
          </ul>
          <div style={{ display: "inline-block", float: "right" }}>
            <ul style={{ listStyle: "none" }}>
              <li style={{ marginBottom: "3%" }}>
                <Button
                  icon
                  labelPosition="left"
                  size="large"
                  style={{ width: "100%" }}
                  onClick={this.onLock}
                >
                  <Icon name="lock" />
                  Lock ETH
                </Button>
              </li>
              <li style={{ marginBottom: "3%" }}>
                <Button
                  icon
                  labelPosition="left"
                  size="large"
                  style={{ width: "100%" }}
                  onClick={this.onFree}
                >
                  <Icon name="lock open" />
                  Free PETH
                </Button>
              </li>
              <li>
                <Button
                  icon
                  labelPosition="left"
                  color="red"
                  size="large"
                  style={{ width: "100%" }}
                  onClick={this.shutCDP}
                >
                  <Icon name="window close" />
                  Shut CDP
                </Button>
              </li>
            </ul>
          </div>
        </Modal.Content>
      </Modal>
    );
  }

  onLock = async () => {
    this.props.store!.showLock(this.props.cdp);
  };

  onFree = () => {
    this.props.store!.showFree(this.props.cdp);
  };

  shutCDP = async () => {
    await this.props.store!.shutCDP(this.props.cdp);
    this.props.onRequestClose();
  };
}

export default inject('store')(observer(CDPDetails));
