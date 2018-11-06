import React from "react";
import { observer, inject } from "mobx-react";
import styled from "styled-components";
import { Card, Button } from "../ui";
import { PieChart, Pie, Cell } from "recharts";
import CDP from "../store/cdp";
import { Store } from "../store";

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

class CDPCard extends React.Component<Props> {
  render() {
    const { cdp } = this.props;
    return (
      <>
        <Card
          onClick={this.onClick}
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
          <InfoContainer>
            <div>ETH</div>
            <Row>
              <RowCell>
                {" "}
                <div>{cdp.ethLocked.get().toFixed(2)} Locked </div>{" "}
                <Button onClick={() => {}}>Deposit</Button>
              </RowCell>
              <RowCell>
                {" "}
                <div>NaN Available </div>{" "}
                <Button red onClick={() => {}}>
                  Withdraw
                </Button>{" "}
              </RowCell>
            </Row>
            <div>DAI</div>
            <Row>
              <RowCell>
                <div>{cdp.daiLocked.get().toFixed(2)} Generated</div>
                <Button onClick={() => {}}>Payback</Button>
              </RowCell>
              <RowCell>
                <div>{cdp.daiAvailable.get().toFixed(2)} Available</div>
                <Button red onClick={() => {}}>
                  Generate
                </Button>
              </RowCell>
            </Row>
          </InfoContainer>
          {/* <Card.Content extra>
            <div className="ui two buttons">
              <Button basic color="blue" onClick={this.drawDai}>
                Draw
              </Button>
              <Button basic color="green" onClick={this.repayDai}>
                Repay
              </Button>
            </div>
          </Card.Content> */}
        </Card>
      </>
    );
  }

  onClick = () => {
    this.props.store!.showDetails(this.props.cdp);
  };

  drawDai = () => {
    this.props.store!.showDraw(this.props.cdp);
  };

  repayDai = () => {
    this.props.store!.showRepay(this.props.cdp);
  };
}

export default inject("store")(observer(CDPCard));
