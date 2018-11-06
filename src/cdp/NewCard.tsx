import * as React from "react";
import { Card } from "../ui";

export default class NewCard extends React.Component {
  state = {
    showForm: false
  };
  render() {
    const { showForm } = this.state;
    return (
      <Card flipped={!!showForm} onClick={this.onClick}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200
          }}
        >
          +
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          New CDP
        </div>
      </Card>
    );
  }

  onClick = () => {
    this.setState({ showForm: true });
  };
}
