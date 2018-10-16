import React, { Component } from "react";
import CDPList from "../cdp/List";
import NewCdpModal from "./CDPCreator";

export default class Work extends Component {
  state = {
    showNewCDPModal: false
  };
  render() {
    return (
      <>
        <CDPList
          key={this.props.address}
          address={this.props.address}
          wethToPeth={this.props.wethToPeth}
          ethPrice={this.props.ethPrice}
          liquidationRatio={this.props.liquidationRatio}
          onNewCDP={this.onNewCDP}
        />
        {this.state.showNewCDPModal && (
          <NewCdpModal
            web3={this.props.web3}
            address={this.props.address}
            onRequestClose={this.onCloseNewCDP}
          />
        )}
      </>
    );
  }

  onNewCDP = () => {
    this.setState({
      showNewCDPModal: true
    });
  };

  onCloseNewCDP = () => {
    this.setState({
      showNewCDPModal: false
    });
  };
}
