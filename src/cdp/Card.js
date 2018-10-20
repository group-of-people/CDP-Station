import React from "react";
import { Card, Button } from "semantic-ui-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Chart = ({ data }) => (
  <PieChart height={200} width={260}>
    <Pie
      startAngle={90}
      endAngle={450}
      data={data}
      outerRadius={80}
      fill="#8884d8"
      isAnimationActive={false}
      dataKey={"value"}
    >
      {data.map((entry, index) => (
        <Cell key={index} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
);

class CDPCard extends React.Component {
  render() {
    const { cdp } = this.props;
    return (
      <>
        <Card onClick={this.onClick}>
          <Chart
            data={[
              { name: "DAI Debt", value: cdp.daiDebt.toNumber() },
              { name: "DAI Available", value: cdp.daiAvailable }
              // {name: "DAI Collateral", value: cdp.daiLocked - cdp.daiAvailable - cdp.daiDebt.toNumber()}
            ]}
          />
          <Card.Content textAlign={"right"}>
            <Card.Header>CDP {cdp.id} </Card.Header>
            <Card.Meta>{cdp.ethLocked.toFixed(4)} ETH </Card.Meta>
          </Card.Content>
          <Card.Content extra>
            <div className="ui two buttons">
              <Button basic color="blue" onClick={this.drawDai}>
                Draw
              </Button>
              <Button basic color="green" onClick={this.repayDai}>
                Repay
              </Button>
            </div>
          </Card.Content>
        </Card>
      </>
    );
  }

  onClick = () => {
    this.props.onClick(this.props.cdp);
  };

  drawDai = () => {
    this.props.drawDAI(this.props.cdp);
  };

  repayDai = () => {
    this.props.repayDAI(this.props.cdp);
  };
}

export default CDPCard;
