import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Icon, Card } from "semantic-ui-react";
import CDPCard from "./Card";
import { Store } from "../store";

interface Props {
  store?: Store;
}

interface State {}

export class CDPList extends Component<Props, State> {
  state: State = {};

  render() {
    return (
      <>
        <Card.Group>
          {this.props.store!.cdps.map(cdp => (
            <CDPCard key={cdp.id} cdp={cdp} />
          ))}
          <Card onClick={this.props.store!.showNew}>
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
}

export default inject("store")(observer(CDPList));
