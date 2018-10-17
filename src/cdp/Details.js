import React, { Component } from "react";
import { Modal, Header } from "semantic-ui-react";

export default class CDPDetails extends Component {
  render() {
    const { cdp } = this.props;

    return (
      <Modal open closeIcon onClose={this.props.onRequestClose}>
        <Header>CDP #{cdp.id}</Header>
        <Modal.Content>
          <ul>
            <li>CDP - {cdp.id}</li>
            <li>Debt - {cdp.daiDebt.toString(4)}</li>
            <li>
              DAI Available -{" "}
              {(
                cdp.daiLocked / this.props.store.liquidationRatio.get() -
                cdp.daiDebt.toNumber()
              ).toFixed(4)}{" "}
              DAI
            </li>
            <li>Collateral ETH - {cdp.ethLocked.toFixed(4)} ETH</li>
            <li>Collateral DAI - {cdp.daiLocked.toFixed(4)} DAI</li>
            <li>WETH/PETH - {this.props.store.wethToPeth.get().toFixed(4)}</li>
            <li>PETH locked - {cdp.pethLocked.toString(4)}</li>
          </ul>
        </Modal.Content>
      </Modal>
    );
  }
}
