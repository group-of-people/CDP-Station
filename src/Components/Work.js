import React, { Component } from 'react';
import CDPList from "./CDPList";
import CDPCreator from "./CDPCreator";

export default class Work extends Component {
    componentDidMount() {
    }
    render() {
      return (
        <div>
            <CDPList
                key={this.props.address}
                address={this.props.address}
                wethToPeth={this.props.wethToPeth}
                ethPrice={this.props.ethPrice}
                liquidationRatio={this.props.liquidationRatio}
            />

            <CDPCreator
                web3={this.props.web3}
                address={this.props.address}
            />
        </div>
      );
    }
}