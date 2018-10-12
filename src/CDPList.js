import React, { Component } from "react";
import Maker from "@makerdao/dai";
import { Table } from 'semantic-ui-react'

const { DAI, PETH } = Maker;

function humanizeCDPResponse(cdp) {
  return {
    id: cdp.cupi,
    daiDebt: DAI.wei(cdp.art),
    pethLocked: PETH.wei(cdp.ink)
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
      cdps: response.results.map(cdp => humanizeCDPResponse(cdp))
    });
  }

  render() {
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>CDP Id</Table.HeaderCell>
            <Table.HeaderCell>Debt</Table.HeaderCell>
            <Table.HeaderCell>PETH locked</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.state.cdps.map(cdp => (
            <Table.Row>
              <Table.Cell>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://mkr.tools/cdp/${cdp.id}`}
                >
                  {cdp.id}
                </a>
              </Table.Cell>
              <Table.Cell>{cdp.daiDebt.toString(6)}</Table.Cell>
              <Table.Cell>{cdp.pethLocked.toString(6)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }
}
