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
    const display = this.props.mode === "work" ? "flex" : "block";

    return (
      <>
        <div style={{ display: display }}>
          {this.props.store!.cdps.map(cdp => (
            <CDPCard key={cdp.id} cdp={cdp} wide={this.props.mode === "work"} />
          ))}
          <NewCard />
        </div>
      </>
    );
  }
}

export default inject("store")(observer(CDPList));
