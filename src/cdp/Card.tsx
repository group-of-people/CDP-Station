import React from "react";
import { observer, inject } from "mobx-react";
import styled from "styled-components";
import { PieChart, Pie, Cell } from "recharts";
import { Card, Button } from "../ui";
import CDP from "../store/cdp";
import { Store } from "../store";
import Lock from "./Forms/Lock";
import Free from "./Forms/Free";
import Draw from "./Forms/Draw";
import Repay from "./Forms/Repay";

const COLORS = ["#00C49F", "#0088FE", "#FFBB28", "#FF8042"];

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
`;
const Row = styled.div`
  display: flex;
`;
const RowCell = styled.div`
  flex: 1;
`;

const Chart = ({ data }: { data: { name: string; value: number }[] }) => (
  <PieChart height={260} width={260}>
    <Pie
      startAngle={90}
      endAngle={450}
      data={data}
      outerRadius={130}
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
  mode: string;
}

interface State {
  view: "details" | "deposit" | "withdraw" | "payback" | "generate";
}

class CDPCard extends React.Component<Props, State> {
  state: State = {
    view: "details"
  };
  render() {
    const { cdp } = this.props;
    return (
      <>
        <Card
          flipped={this.state.view !== "details"}
          backside={this.renderView()}
          extra={
            this.props.mode === "work" ? (
              <div>
                CDP {cdp.id}
                <Chart
                  data={[
                    { name: "DAI Available", value: cdp.daiAvailable.get() },
                    { name: "DAI Debt", value: cdp.daiDebt.get().toNumber() }
                    // {name: "DAI Collateral", value: cdp.daiLocked - cdp.daiAvailable - cdp.daiDebt.toNumber()}
                  ]}
                />
                Risk: low
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
        <div>ETH</div>
        <Row>
          <RowCell>
            <div>{cdp.ethLocked.get().toFixed(2)} Locked </div>
            <Button onClick={() => this.setState({ view: "deposit" })}>
              Deposit
            </Button>
          </RowCell>
          <RowCell>
            <div>{cdp.ethAvailable.get().toFixed(2)} Available </div>
            <Button red onClick={() => this.setState({ view: "withdraw" })}>
              Withdraw
            </Button>
          </RowCell>
        </Row>
        <div>DAI</div>
        <Row>
          <RowCell>
            <div>{cdp.daiLocked.get().toFixed(2)} Generated</div>
            <Button onClick={() => this.setState({ view: "payback" })}>
              Payback
            </Button>
          </RowCell>
          <RowCell>
            <div>{cdp.daiAvailable.get().toFixed(2)} Available</div>
            <Button red onClick={() => this.setState({ view: "generate" })}>
              Generate
            </Button>
          </RowCell>
        </Row>
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
