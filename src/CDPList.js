import React, { Component } from "react";
import Maker from "@makerdao/dai";
import { Container, Table, Checkbox } from "semantic-ui-react";

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
    cdps: [],
    details: false
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
    const { details } = this.state;
    return (
      <>
        <Container textAlign="right">
          <Checkbox
            toggle
            label={"Details"}
            checked={details}
            onChange={this.onDetailsChange}
          />
        </Container>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>CDP Id</Table.HeaderCell>
              <Table.HeaderCell>Debt</Table.HeaderCell>
              <Table.HeaderCell>Collateral</Table.HeaderCell>
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
                <Table.Cell>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://mkr.tools/cdp/${cdp.id}`}
                  >
                    {cdp.id}
                  </a>
                </Table.Cell>
                <Table.Cell>{cdp.daiDebt.toString(4)}</Table.Cell>
                <Table.Cell>
                  {this.getLockedEth(cdp)}({this.getLockedDai(cdp)})
                </Table.Cell>
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

  getLockedEth(cdp) {
    return (
      (cdp.pethLocked.toNumber() * this.props.wethToPeth).toFixed(4) + "  ETH"
    );
  }

  getLockedDai(cdp) {
    return (
      (
        cdp.pethLocked.toNumber() *
        this.props.wethToPeth *
        this.props.ethPrice.toNumber()
      ).toFixed(4) + " DAI"
    );
  }

  onDetailsChange = () => {
    this.setState({ details: !this.state.details });
  };
}
