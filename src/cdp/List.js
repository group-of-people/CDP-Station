import React, { Component } from "react";
import { observer } from "mobx-react";
import { Icon, Table, Card } from "semantic-ui-react";
import CDPCard from "./Card";


export class CDPList extends Component {
  render() {
    const details = true;
    return (
      <>
        <Card.Group>
          {this.props.store.cdps.map(cdp => (
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
            {this.props.store.cdps.map(cdp => (
              <Table.Row key={cdp.id}>
                <Table.Cell>#{cdp.id}</Table.Cell>
                <Table.Cell>{cdp.daiDebt.toString(4)}</Table.Cell>
                <Table.Cell>
                  {(
                    cdp.daiLocked / this.props.store.liquidationRatio.get() -
                    cdp.daiDebt.toNumber()
                  ).toFixed(4)}{" "}
                  DAI
                </Table.Cell>
                <Table.Cell>{cdp.ethLocked.toFixed(4)} ETH</Table.Cell>
                <Table.Cell>{cdp.daiLocked.toFixed(4)} DAI</Table.Cell>
                {details && (
                  <>
                    <Table.Cell>{this.props.store.wethToPeth.get().toFixed(4)}</Table.Cell>
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

export default observer(CDPList)