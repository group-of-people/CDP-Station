import React, { Component } from "react";

export default class CDPList extends Component {
  state = {
    cdps: []
  };
  async componentDidMount() {
    const result = await fetch(
      `https://dai-service.makerdao.com/cups/conditions=lad:${this.props.address.toLowerCase()}/sort=cupi:asc`
    );
    const resposne = await result.json();
    this.setState({ cdps: resposne.results.map(cdp => cdp.cupi) });
  }

  render() {
    return (
      <ul>
        {this.state.cdps.map(cdp => (
          <li>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://mkr.tools/cdp/${cdp}`}
            >
              #{cdp}
            </a>
          </li>
        ))}
      </ul>
    );
  }
}
