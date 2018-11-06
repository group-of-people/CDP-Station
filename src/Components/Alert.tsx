import React, { Component } from "react";
import { Table } from "../ui";
import { observer, inject } from "mobx-react";
import { Store } from "../store";

interface Props {
  store?: Store;
}

export class Alert extends Component<Props, {}> {
  render() {
    return (
      <>
        <Table singleLine collapsing style={{ width: "85%" }}>
          {/* <Table.Header>
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
                <Table.Cell>{cdp.pethLocked.get().toString(4)}</Table.Cell>
                <Table.Cell>{cdp.daiDebt.get().toString(4)}</Table.Cell>
                <Table.Cell>
                  {(
                    (cdp.daiDebt.get().toNumber() *
                      this.props.store.mkrSettings.get()!.liquidationRatio) /
                    cdp.ethLocked.get()
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
          </Table.Body> */}
        </Table>
      </>
    );
  }
}

export default inject("store")(observer(Alert));
