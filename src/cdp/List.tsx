import React, { Component } from "react";
import { observer } from "mobx-react";
import { Icon, Card } from "semantic-ui-react";
import CDPCard from "./Card";
import CDPDetails from "./Modals/Details";
import CDPDraw from "./Modals/Draw";
import CDPRepay from "./Modals/Repay";
import {Store, CDP} from '../store'

interface Props {
  store: Store,
  onNewCDP: () => void
}

interface State {
  detailsCDP: CDP | null,
  cdpDetails: boolean,
  draw: boolean,
  repay: boolean
}

export class CDPList extends Component<Props, State> {
  state: State = {
    detailsCDP: null,
    cdpDetails: false,
    draw: false,
    repay: false
  };

  render() {
    return (
      <>
        {!!this.state.cdpDetails && (
          <CDPDetails
            cdp={this.state.detailsCDP!}
            store={this.props.store}
            onRequestClose={this.onCDPDetailsClose}
          />
        )}
        {!!this.state.draw && (
          <CDPDraw
            cdp={this.state.detailsCDP!}
            store={this.props.store}
            onRequestClose={this.onCDPDrawClose}
          />
        )}
        {!!this.state.repay && (
          <CDPRepay
            cdp={this.state.detailsCDP!}
            store={this.props.store}
            onRequestClose={this.onCDPRepayClose}
          />
        )}
        <Card.Group>
          {this.props.store.cdps.map(cdp => (
            <CDPCard
              key={cdp.id}
              cdp={cdp}
              onClick={this.onCDPDetails}
              drawDAI={this.onCDPDraw}
              repayDAI={this.onCDPRepay}
            />
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

  onCDPDetails = (cdp: CDP) => {
    this.setState({ detailsCDP: cdp, cdpDetails: true });
  };

  onCDPDetailsClose = () => {
    this.setState({ detailsCDP: null, cdpDetails: false });
  };

  onCDPDraw = (cdp: CDP) => {
    this.setState({ draw: true, detailsCDP: cdp });
  };

  onCDPDrawClose = () => {
    this.setState({ draw: false, cdpDetails: false });
  };

  onCDPRepay = (cdp: CDP) => {
    this.setState({ repay: true, detailsCDP: cdp });
  };

  onCDPRepayClose = () => {
    this.setState({ repay: false, cdpDetails: false });
  };
}

export default observer(CDPList);
