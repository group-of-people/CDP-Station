import React, { Component } from "react";
import { observer } from "mobx-react";
import { Icon, Card } from "semantic-ui-react";
import CDPCard from "./Card";
import CDPDetails from './Details'

export class CDPList extends Component {
  state = {
    detailsCDP: null
  };

  render() {
    return (
      <>
        {!!this.state.detailsCDP && (
          <CDPDetails
            cdp={this.state.detailsCDP}
            store={this.props.store}
            onRequestClose={this.onCDPDetailsClose}
          />
        )}
        <Card.Group>
          {this.props.store.cdps.map(cdp => (
            <CDPCard key={cdp.id} cdp={cdp} onClick={this.onCDPDetails} />
          ))}
          <Card onClick={this.props.onNewCDP}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200
              }}
            >
              <Icon name="add circle" size="massive" color={"yellow"} />
            </div>
            <Card.Content
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Card.Header>New CDP</Card.Header>
            </Card.Content>
          </Card>
        </Card.Group>
      </>
    );
  }

  onCDPDetails = cdp => {
    this.setState({ detailsCDP: cdp });
  };

  onCDPDetailsClose = () => {
    this.setState({ detailsCDP: null });
  };
}

export default observer(CDPList);
