import React from "react";
import { Card } from "../ui";
import Creator from "./Forms/Creator";

export default class NewCard extends React.Component {
  state = {
    showForm: false
  };
  render() {
    const { showForm } = this.state;
    return (
      <Card
        flipped={!!showForm}
        backside={
          <Creator
            onRequestClose={() => {
              this.setState({ showForm: false });
            }}
          />
        }
        onClick={!showForm ? this.onClick : void 0}
      >
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
