import React, { Component } from "react";
import { Table } from "semantic-ui-react";

export default class Alert extends Component {
  state = {};
  render() {
    return (
      <>
        <div>{this.props.store.ethPrice.get().toString()}</div>
        <div>{this.props.store.mkrPrice.get().toString()}</div>

        <Table singleLine collapsing style={{ width: "85%" }}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>CDP</Table.HeaderCell>
              <Table.HeaderCell>Collateral</Table.HeaderCell>
              <Table.HeaderCell>Debt</Table.HeaderCell>
              <Table.HeaderCell>Liq. Price</Table.HeaderCell>
              <Table.HeaderCell>At Risk</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {this.props.store.cdps.map(cdp => (
              <Table.Row>
                <Table.Cell>{cdp.id}</Table.Cell>
                <Table.Cell>{cdp.pethLocked.toString(4)}</Table.Cell>
                <Table.Cell>{cdp.daiDebt.toString(4)}</Table.Cell>
                <Table.Cell>
                  {(
                    (parseFloat(cdp.daiDebt) *
                      this.props.store.liquidationRatio.get()) /
                    parseFloat(cdp.ethLocked)
                  ).toFixed(2)}
                </Table.Cell>
                <Table.Cell>
                  {this.props.store.isSafe(cdp) && <div>Safe</div>}
                  {!this.props.store.isSafe(cdp) && (
                    <div style={{ color: "red" }}>Not Safe</div>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </>
    );
  }
}
