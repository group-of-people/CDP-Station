import React, { Component } from "react";
import Maker from "@makerdao/dai";
import { Icon, Table, Card } from "semantic-ui-react";
import CDPCard from "./Card";

const { DAI, PETH } = Maker;

function humanizeCDPResponse(cdp, props) {
  const pethLocked = PETH.wei(cdp.ink);
  const daiDebt = DAI.wei(cdp.art);
  const daiLocked =
    pethLocked.toNumber() * props.wethToPeth * props.ethPrice.toNumber();
  const daiAvailable = daiLocked / props.liquidationRatio - daiDebt.toNumber();

  return {
    id: cdp.cupi,
    daiAvailable,
    daiDebt,
    daiLocked,
    pethLocked,
    ethLocked: pethLocked.toNumber() * props.wethToPeth
  };
}

export default class CDPList extends Component {
  state = {
    cdps: []
  };
  async componentDidMount() {
    const result = await fetch(
      `https://dai-service.makerdao.com/cups/conditions=lad:${this.props.address.toLowerCase()}/sort=cupi:asc`
    );
    const response = await result.json();
    this.setState({
      cdps: response.results.map(cdp => humanizeCDPResponse(cdp, this.props))
    });
  }

  render() {
    const details = true;
    return (
      <>
        <Card.Group>
          {this.state.cdps.map(cdp => (
            <CDPCard key={cdp.id} cdp={cdp} />
          ))}
          <Card onClick={this.props.onNewCDP}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200
              }}
            >
              <Icon name="add circle" size="massive" color={"yellow"} />
            </div>
            <Card.Content
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Card.Header>New CDP</Card.Header>
            </Card.Content>
          </Card>
        </Card.Group>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>CDP</Table.HeaderCell>
              <Table.HeaderCell>Debt</Table.HeaderCell>
              <Table.HeaderCell>DAI Available</Table.HeaderCell>
              <Table.HeaderCell>Collateral ETH</Table.HeaderCell>
              <Table.HeaderCell>Collateral DAI</Table.HeaderCell>
              {details && (
                <>
                  <Table.HeaderCell>WETH/PETH</Table.HeaderCell>
                  <Table.HeaderCell>PETH locked</Table.HeaderCell>
                </>
              )}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.state.cdps.map(cdp => (
              <Table.Row>
                <Table.Cell>#{cdp.id}</Table.Cell>
                <Table.Cell>{cdp.daiDebt.toString(4)}</Table.Cell>
                <Table.Cell>
                  {(
                    cdp.daiLocked / this.props.liquidationRatio -
                    cdp.daiDebt.toNumber()
                  ).toFixed(4)}{" "}
                  DAI
                </Table.Cell>
                <Table.Cell>{cdp.ethLocked.toFixed(4)} ETH</Table.Cell>
                <Table.Cell>{cdp.daiLocked.toFixed(4)} DAI</Table.Cell>
                {details && (
                  <>
                    <Table.Cell>{this.props.wethToPeth.toFixed(4)}</Table.Cell>
                    <Table.Cell>{cdp.pethLocked.toString(4)}</Table.Cell>
                  </>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </>
    );
  }
}
