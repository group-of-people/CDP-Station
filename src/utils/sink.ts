import Web3 from "web3";

const floatRE = new RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

export function isValidFloatInputNumber(value: string) {
  if (value === "" || floatRE.test(value)) return true;
  return false;
}

export function parseInputFloat(value: string) {
  return value === "" ? 0 : isNaN(parseFloat(value)) ? 0 : parseFloat(value);
}

const metamask = window.ethereum as any;
const P = new Web3.providers.HttpProvider(
  "https://mainnet.infura.io/v3/978b1fd724214f40938cf5cfd916e481"
);

export class Provider {
  async enable() {
    //@ts-ignore
    return metamask.enable();
  }

  sendAsync(payload: any, cb: any) {
    if (payload.method === "eth_call") {
      return P.send(payload, cb);
    }

    return metamask.send(payload, cb);

    // const proxy = [
    //   "eth_accounts",
    //   "eth_getBlockByNumber",
    //   "web3_clientVersion",
    //   "net_version",
    //   "eth_protocolVersion",
    //   "eth_getTransactionCount",
    //   "eth_blockNumber",
    //   "eth_getBalance",
    //   "eth_gasPrice"
    // ];
    // if (~proxy.indexOf(payload.method)) {
    //   return metamask.send(payload, cb);
    // }
    // if (payload.method === "eth_sendTransaction") {
    //   const signed = metamask
    //     .sign(payload.params[0])
    //     .then((raw: string, object: any) => {
    //       P.send(
    //         {
    //           ...payload,
    //           method: 'eth_sendRawTransaction',
    //           params: [raw]
    //         },
    //         cb
    //       );
    //     });
    // }
  }
}

window.ethereum = new Provider();
