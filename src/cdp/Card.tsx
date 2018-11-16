import React from "react";
import { observer, inject } from "mobx-react";
import styled from "styled-components";
import { PieChart, Pie, Cell } from "recharts";
import { Card, Button, Header } from "../ui";
import CDP from "../store/cdp";
import { Store } from "../store";
import Lock from "./Forms/Lock";
import Free from "./Forms/Free";
import Draw from "./Forms/Draw";
import Repay from "./Forms/Repay";

const COLORS = ["#66BB6A", "#E04980", "#FFBB28", "#FF8042"];

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`;
const Row = styled.div`
  display: flex;
`;
const RowCell = styled.div`
  flex: 1;
`;

interface LegendItemProps {
  color: string;
}

const LegendItem = styled.div`
  height: 30px;
  display: flex;
  align-items: center;
  
  &:before {
    content: ' ';
    background-color: ${(props: LegendItemProps) => props.color}
    width: 10px;
    height: 10px;
    display: inline-block;
    margin-right: 5px;
  }
`;

const Chart = ({ data }: { data: { name: string; value: number }[] }) => (
  <PieChart height={220} width={220} style={{ margin: "auto" }}>
    <Pie
      startAngle={90}
      endAngle={450}
      data={data}
      outerRadius={110}
      fill="#8884d8"
      isAnimationActive={false}
      dataKey={"value"}
    >
      {data.map((entry, index) => (
        <Cell key={index} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
  </PieChart>
);

interface Props {
  store?: Store;
  cdp: CDP;
  wide?: boolean;
  view?: "details" | "deposit" | "withdraw" | "payback" | "generate";
}

interface State {
  view: "details" | "deposit" | "withdraw" | "payback" | "generate";
}

class CDPCard extends React.Component<Props, State> {
  state: State = {
    view: this.props.view || "details"
  };
  render() {
    const { cdp } = this.props;
    return (
      <>
        <Card
          flipped={this.state.view !== "details"}
          backside={this.renderView()}
          extra={
            this.props.wide !== false ? (
              <div
                style={{
                  padding: "30px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%"
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <Header>CDP {cdp.id}</Header>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <Chart
                    data={[
                      { name: "DAI Available", value: cdp.daiAvailable.get() },
                      { name: "DAI Debt", value: cdp.daiDebt.get().toNumber() }
                      // {name: "DAI Collateral", value: cdp.daiLocked - cdp.daiAvailable - cdp.daiDebt.toNumber()}
                    ]}
                  />
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <LegendItem color={COLORS[0]}>Available</LegendItem>
                  <LegendItem color={COLORS[1]}>Debt</LegendItem>
                </div>
              </div>
            ) : (
              void 0
            )
          }
        >
          {this.renderDetails()}
        </Card>
      </>
    );
  }

  renderView() {
    switch (this.state.view) {
      case "deposit":
        return <Lock cdp={this.props.cdp} onRequestClose={this.flipBack} />;
      case "withdraw":
        return <Free cdp={this.props.cdp} onRequestClose={this.flipBack} />;
      case "payback":
        return <Repay cdp={this.props.cdp} onRequestClose={this.flipBack} />;
      case "generate":
        return <Draw cdp={this.props.cdp} onRequestClose={this.flipBack} />;
      default:
        return null;
    }
  }

  renderDetails() {
    const { cdp } = this.props;

    return (
      <InfoContainer>
        <div>
          <Header>ETH</Header>
          <Row>
            <RowCell>
              <div style={{ color: "#b5b5b5", marginTop: 5 }}>Locked:</div>
              <div style={{ marginBottom: 10 }}>
                {cdp.ethLocked.get().toFixed(2)}
              </div>
              <Button onClick={() => this.setState({ view: "deposit" })}>
                Deposit
              </Button>
            </RowCell>
            <RowCell>
              <div style={{ color: "#b5b5b5", marginTop: 5 }}>Available:</div>
              <div style={{ marginBottom: 10 }}>
                {cdp.ethAvailable.get().toFixed(2)}{" "}
              </div>
              <Button
                color={"red"}
                onClick={() => this.setState({ view: "withdraw" })}
              >
                Withdraw
              </Button>
            </RowCell>
          </Row>
        </div>
        <div>
          <Header>DAI</Header>
          <Row>
            <RowCell>
              <div style={{ color: "#b5b5b5", marginTop: 5 }}>Generated:</div>
              <div style={{ marginBottom: 10 }}>
                {cdp.daiLocked.get().toFixed(2)}{" "}
              </div>
              <Button onClick={() => this.setState({ view: "payback" })}>
                Payback
              </Button>
            </RowCell>
            <RowCell>
              <div style={{ color: "#b5b5b5", marginTop: 5 }}>Available:</div>
              <div style={{ marginBottom: 10 }}>
                {cdp.daiAvailable.get().toFixed(2)}
              </div>
              <Button
                color={"red"}
                onClick={() => this.setState({ view: "generate" })}
              >
                Generate
              </Button>
            </RowCell>
          </Row>
        </div>
        <div>
          <div
            style={{
              color: "#b5b5b5",
              marginTop: 10,
              fontSize: 20,
              marginBottom: 5
            }}
          >
            Liquidation Price
          </div>

          <Row>
            <div>{cdp.liquidationPrice.get()} USD/ETH</div>
          </Row>
        </div>
      </InfoContainer>
    );
  }

  flipBack = () => {
    this.setState({
      view: "details"
    });
  };
}

export default inject("store")(observer(CDPCard));
