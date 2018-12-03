import React from "react";
import { Card } from "../ui";
import Creator from "./Forms/Creator";
import { AddCircleOutline as PlusCircleIcon } from "styled-icons/material";

interface Props {
  flipped?: boolean;
}

export default class NewCard extends React.Component<Props> {
  state = {
    showForm: !!this.props.flipped
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
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <PlusCircleIcon size={150} />
          New CDP
        </div>
      </Card>
    );
  }

  onClick = () => {
    this.setState({ showForm: true });
  };
}
