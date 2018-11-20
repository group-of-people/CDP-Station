import React from "react";
import { storiesOf } from "@storybook/react";
import "sanitize.css";
import "../index.css";
import { Button, Input } from "../ui";

storiesOf("UI", module)
  .add("Button", () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        padding: 10,
        backgroundColor: "#455A64"
      }}
    >
      <Button style={"primary"} onClick={() => {}}>
        Primary
      </Button>
      <div style={{ width: 10 }} />
      <Button style={"primary"} disabled onClick={() => {}}>
        Primary Disabled
      </Button>
      <div style={{ width: 10 }} />
      <Button onClick={() => {}}>Secondary</Button>
      <div style={{ width: 10 }} />
      <Button color={"red"} onClick={() => {}}>
        Secondary
      </Button>
      <div style={{ width: 10 }} />
      <Button style={"muted"} color={"gray"} onClick={() => {}}>
        Muted
      </Button>
      <div style={{ width: 10 }} />
      <div style={{ width: 10 }} />
    </div>
  ))
  .add("Input", () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        padding: 10,
        backgroundColor: "#455A64"
      }}
    >
      <Input label={"Label"} value={"123"} unit={"UNIT"} onChange={() => {}}>
        Max 9999 UNIT
      </Input>
      <br />
      <Input value={"123"} unit={"ETH"} onChange={() => {}} />
      <br />
      <Input value={"123"} unit={"ETH"} onChange={() => {}} />
      <br />
      <Input value={"123"} unit={"ETH"} onChange={() => {}} />
      <br />
    </div>
  ));
