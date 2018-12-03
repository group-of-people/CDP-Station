import React, { Component } from "react";
import CDPList from "../cdp/List";

export class Helper extends Component<{}, {}> {
  render() {
    return (
      <>
        <CDPList mode={"helper"} />
      </>
    );
  }
}

export default Helper;
