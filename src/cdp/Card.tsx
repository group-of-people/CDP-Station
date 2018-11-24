import React from "react";
import { observer, inject } from "mobx-react";
import styled from "styled-components";
import { PieChart, Pie, Cell } from "recharts";
import { Card, Button, Header2 } from "../ui";
import { Circular as Loader } from "../ui/Loader";
import CDP from "../store/cdp";
import { Store } from "../store";
import Lock from "./Forms/Lock";
import Free from "./Forms/Free";
import Draw from "./Forms/Draw";
import Repay from "./Forms/Repay";
import { LiquidationPrice } from "./Forms/common";

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

type VIEWS = "details" | "deposit" | "withdraw" | "payback" | "generate";

interface Props {
  store?: Store;
  cdp: CDP;
  wide?: boolean;
  view?: VIEWS;
}

interface State {
  view: VIEWS;
}

class CDPCard extends React.Component<Props, State> {
  state: State = {
    view: this.props.view || "details"
  };

  previewCdp: CDP = this.props.cdp.clone();

  render() {
    const cdp = this.previewCdp;
    const isFlipped = this.state.view !== "details";

    return (
      <>
        <Card
          flipped={isFlipped}
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
                <div
                  style={{
                    textAlign: "center",
                    marginTop: isFlipped ? 4 : 0,
                    transition: "all 0.3s"
                  }}
                >
                  <Header2>CDP {cdp.id}</Header2>
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
        return (
          <Lock
            previewCdp={this.previewCdp}
            cdp={this.props.cdp}
            onRequestClose={this.flipBack}
          />
        );
      case "withdraw":
        return (
          <Free
            previewCdp={this.previewCdp}
            cdp={this.props.cdp}
            onRequestClose={this.flipBack}
          />
        );
      case "payback":
        return (
          <Repay
            previewCdp={this.previewCdp}
            cdp={this.props.cdp}
            onRequestClose={this.flipBack}
          />
        );
      case "generate":
        return (
          <Draw
            previewCdp={this.previewCdp}
            cdp={this.props.cdp}
            onRequestClose={this.flipBack}
          />
        );
      default:
        return null;
    }
  }

  renderDetails() {
    const { cdp, store } = this.props;
    const pendingTx = store!.pendingTxs.get(cdp.id);
    const hasPendingTx = !!pendingTx;
    return (
      <InfoContainer>
        {hasPendingTx && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Loader color={"#90A4AE"} /> Deposit pending&nbsp;
            <a
              target="_blank"
              rel="noopener"
              href={`https://etherscan.io/tx/${pendingTx![0]}`}
            >
              View Tx
            </a>
          </div>
        )}
        <div>
          <Header2>ETH</Header2>
          <Row>
            <RowCell>
              <div style={{ color: "#b5b5b5", marginTop: 5 }}>Locked:</div>
              <div style={{ marginBottom: 10 }}>
                {cdp.ethLocked.get().toFixed(2)}
              </div>
              {!hasPendingTx && (
                <Button onClick={() => this.switchTo("deposit")}>
                  Deposit
                </Button>
              )}
            </RowCell>
            <RowCell>
              <div style={{ color: "#b5b5b5", marginTop: 5 }}>Available:</div>
              <div style={{ marginBottom: 10 }}>
                {cdp.ethAvailable.get().toFixed(2)}{" "}
              </div>
              {!hasPendingTx && (
                <Button color={"red"} onClick={() => this.switchTo("withdraw")}>
                  Withdraw
                </Button>
              )}
            </RowCell>
          </Row>
        </div>
        <div>
          <Header2>DAI</Header2>
          <Row>
            <RowCell>
              <div style={{ color: "#b5b5b5", marginTop: 5 }}>Generated:</div>
              <div style={{ marginBottom: 10 }}>
                {cdp.daiLocked.get().toFixed(2)}{" "}
              </div>
              {!hasPendingTx && (
                <Button onClick={() => this.switchTo("payback")}>
                  Payback
                </Button>
              )}
            </RowCell>
            <RowCell>
              <div style={{ color: "#b5b5b5", marginTop: 5 }}>Available:</div>
              <div style={{ marginBottom: 10 }}>
                {cdp.daiAvailable.get().toFixed(2)}
              </div>
              {!hasPendingTx && (
                <Button color={"red"} onClick={() => this.switchTo("generate")}>
                  Generate
                </Button>
              )}
            </RowCell>
          </Row>
        </div>
        <LiquidationPrice cdp={cdp} />
      </InfoContainer>
    );
  }

  switchTo = (view: VIEWS) => {
    this.previewCdp = this.props.cdp.clone();
    this.setState({ view });
  };

  flipBack = () => {
    this.setState({
      view: "details"
    });
  };
}

export default inject("store")(observer(CDPCard));
