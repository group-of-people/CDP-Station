import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import CDPCard from "./Card";
import NewCard from "./NewCard";
import { Store } from "../store";

interface Props {
  store?: Store;
  mode: string;
}

interface State {}

export class CDPList extends Component<Props, State> {
  state: State = {};

  render() {
    return (
      <>
        <div style={{ display: "flex" }}>
          {this.props.store!.cdps.map(cdp => (
            <CDPCard key={cdp.id} cdp={cdp} mode={this.props.mode} />
          ))}
          <NewCard />
        </div>
      </>
    );
  }
}

export default inject("store")(observer(CDPList));
