import React, { Component } from "react";
import { Button, Modal, Header, Form, Input, Message } from "semantic-ui-react";
import {inject,observer} from 'mobx-react'
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store } from "../../store";
import CDP from '../../store/cdp'

interface Props {
  store?: Store;
  cdp: CDP;

  onRequestClose: () => void;
}

interface State {
  amountETH: string;
  locking: boolean;
}

export class Lock extends Component<Props, State> {
  state: State = {
    amountETH: this.props.store!.balances.get()!.ethBalance
      .toNumber()
      .toString(),
    locking: false
  };

  render() {
    const store = this.props.store!
    const amountETH = parseInputFloat(this.state.amountETH);

    const wethToPeth = store.prices.get()!. wethToPeth;
    const amountPETH = (amountETH / wethToPeth).toFixed(4);

    const pethLocked = this.props.cdp.pethLocked.get();
    const ethLocked = this.props.cdp.ethLocked.get();

    const ethBalance = store.balances.get()!.ethBalance.toNumber();

    let valid = true;
    let error = "";
    if (amountETH > ethBalance) {
      valid = false;
      error = `You can lock up to ${ethBalance.toFixed(4)} ETH`;
    } else if (!amountETH || amountETH < 0) {
      valid = false;
    }

    return (
      <Modal open closeIcon onClose={this.props.onRequestClose}>
        <Header>Lock ETH</Header>
        <Header
          as="h5"
          style={{
            display: "inline",
            paddingBottom: "0"
          }}
        >
          Locked: {pethLocked.toString(4)} ({ethLocked.toFixed(4)} ETH)
        </Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>ETH to lock</label>
              <Input
                name={"amountETH"}
                label={{ basic: true, content: `${amountPETH} PETH` }}
                labelPosition={"right"}
                placeholder="ETH to lock"
                value={this.state.amountETH}
                onChange={this.handleChange}
              />
            </Form.Field>
            {!valid &&
              error && (
                <Message visible error>
                  {error}
                </Message>
              )}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            loading={this.state.locking}
            disabled={!valid}
            onClick={this.lockETH}
          >
            Lock ETH
          </Button>
          <Button color="red" onClick={this.props.onRequestClose}>
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  lockETH = async () => {
    this.setState({ locking: true });
    await this.props.store!.lockETH(
      parseInputFloat(this.state.amountETH),
      this.props.cdp
    );
    this.props.onRequestClose();
  };

  handleChange = (_e: any, { value }: { value: string }) => {
    if (!isValidFloatInputNumber(value)) {
      return;
    }
    this.setState({ amountETH: value });
  };
}

export default inject('store')(observer(Lock))
