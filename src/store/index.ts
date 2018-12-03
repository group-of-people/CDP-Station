/// <reference path="../../types/maker.d.ts" />

import { observable, runInAction, IObservableValue } from "mobx";
import { request } from "graphql-request";
import Web3 from "web3";
import Maker, { Currency } from "@makerdao/dai";
import CDPCreatorBuild from "!json-loader!../abi/CDPCreator.abi";
import ERC20 from "!json-loader!../abi/ERC20.abi";
import DSToken from "!json-loader!../abi/DSToken.abi";
import ProxyRegistry from "!json-loader!../abi/ProxyRegistry.abi";
import DSProxy from "!json-loader!../abi/DSProxy.abi";
import { DSToken as DSTokenContract } from "../../types/web3-contracts/DSToken";
import { ERC20 as ERC20Contract } from "../../types/web3-contracts/ERC20";
import { CDPCreator as CDPCreatorContract } from "../../types/web3-contracts/CDPCreator";
import { ProxyRegistry as ProxyRegistryContract } from "../../types/web3-contracts/ProxyRegistry";
import { DSProxy as DSProxyContract } from "../../types/web3-contracts/DSProxy";
import CDP, { RawCDP } from "./cdp";

import Prices from "./prices";
import MkrSettings from "./mkrSettings";
import Balances from "./balances";
import Addresses from "./addresses.json";
import Approvals from "./approvals";
import { TransactionReceipt } from "web3/types";

declare global {
  interface Window {
    web3: Web3 | undefined;
    ethereum: any | undefined;
  }
}

const { DAI, PETH, MKR, ETH } = Maker;
export { DAI, PETH, MKR, ETH };

function sleep(seconds: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
}

async function retry<T>(runner: () => Promise<T>): Promise<T> {
  let count = 0;
  return await runner();
  // while (true) {
  //   try {
  //     const result = await runner();
  //     return result
  //   } catch (e) {
  //     count++;
  //     await sleep(5);
  //     if (count >= 3) {
  //       throw e;
  //     }
  //   }
  // }
}

// FIXME: remove me
interface Extra {
  wethToPeth: number;
  ethPrice: Currency;
  liquidationRatio: number;
}

let NEW_CDP_ID = -1;

export class Store {
  // DATA
  cdps = observable<CDP>([]);
  web3: Web3 | null = null;
  account = observable.box("");
  maker: Maker | null = null;

  prices: IObservableValue<Prices | null> = observable.box(null);
  mkrSettings: IObservableValue<MkrSettings | null> = observable.box(null);
  balances: IObservableValue<Balances | null> = observable.box(null);
  approvals: IObservableValue<Approvals | null> = observable.box(null);

  // UI State
  noWeb3 = observable.box(false);
  loading = observable.box(true);
  locked = observable.box(false);
  loadingMessage = observable.box("");
  pendingTxs = observable.map<
    number,
    [
      string,
      "lock" | "free" | "draw" | "repay" | "approve" | "convert" | "create"
    ]
  >({});

  //contract typings
  contract: CDPCreatorContract | null = null;
  mkrContract: ERC20Contract | null = null;
  daiContract: ERC20Contract | null = null;
  pethContract: DSTokenContract | null = null;
  registry: ProxyRegistryContract | null = null;
  proxy: DSProxyContract | null = null;

  constructor() {
    this.enableWeb3().then(() => {
      this.contract = new this.web3!.eth.Contract(
        CDPCreatorBuild.abi,
        Addresses.Creator
      ) as CDPCreatorContract;
      this.mkrContract = new this.web3!.eth.Contract(
        ERC20.abi,
        Addresses.MKR
      ) as ERC20Contract;
      this.daiContract = new this.web3!.eth.Contract(
        ERC20.abi,
        Addresses.DAI
      ) as ERC20Contract;
      this.pethContract = new this.web3!.eth.Contract(
        DSToken.abi,
        Addresses.PETH
      ) as DSTokenContract;
      this.registry = new this.web3!.eth.Contract(
        ProxyRegistry,
        Addresses.Registry
      ) as ProxyRegistryContract;

      this.initializeAccount();
    });
  }

  enableWeb3 = async () => {
    var web3 = window.web3;
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== "undefined") {
      if (window.ethereum) {
        this.web3 = new Web3(window.ethereum);
        try {
          // @ts-ignore
          await window.ethereum.enable();
        } catch (e) {
          console.log(e, "Metamask locked");
        }
      } else {
        this.web3 = new Web3(web3.currentProvider);
        console.log("Injected web3 detected.");
      }
    } else {
      this.noWeb3.set(true);
      return;
    }
  };

  initializeAccount = async (force: boolean = false) => {
    let web3 = this.web3!;
    let accs: string[] = [];
    try {
      accs = await web3.eth.getAccounts();
      if (accs.length === 0) {
        this.locked.set(true);
        this.account.set("");
        setTimeout(this.initializeAccount, 500);
        return;
      }
      this.locked.set(false);
      if (accs[0] === this.account.get() && !force) {
        setTimeout(this.initializeAccount, 500);
        return;
      }
    } catch (e) {
      console.log(e, "Error finding web3.");
      return;
    }

    this.loading.set(true);
    this.updateLoading("Initializing with " + accs[0]);

    this.maker = this.maker
      ? this.maker
      : Maker.create("browser", { confirmedBlockcount: 1 });

    try {
      this.updateLoading("Authenticating maker");
      await this.maker.authenticate();

      const priceService = this.maker.service("price");
      const cdpService = this.maker.service("cdp");

      this.updateLoading("Fetching eth price");
      const ethPrice = await retry(() => priceService.getEthPrice());
      this.updateLoading("Fetching mkr price");
      const mkrPrice = await retry(() => priceService.getMkrPrice());
      this.updateLoading("Fetching weth to peth ratio");
      const wethToPeth = await retry(() => priceService.getWethToPethRatio());
      this.updateLoading("Fetching liquidation ratio");
      const liquidationRatio = await retry(() =>
        cdpService.getLiquidationRatio()
      );
      this.updateLoading("Fetching CDP proxies");
      const proxyAdd = await this.registry!.methods.proxies(accs[0]).call();
      if (proxyAdd !== "0x0000000000000000000000000000000000000000") {
        this.proxy = new this.web3!.eth.Contract(DSProxy, proxyAdd) as DSProxy;
      }

      runInAction(() => {
        this.account.set(accs[0]);
        this.prices.set(new Prices(ethPrice, mkrPrice, wethToPeth));
        this.mkrSettings.set(new MkrSettings(liquidationRatio));
      });
      this.updateLoading("Updating balances");
      await this.updateBalances();
      this.updateLoading("Fetching CDPs");
      await this.updateCDPS();
      this.updateLoading("Fetching approvals");
      await this.getApprovals();
      runInAction(() => {
        this.loading.set(false);
        this.locked.set(false);
      });
      setTimeout(this.initializeAccount, 500);
    } catch (e) {
      this.updateLoading("Failed to initialize. Retrying in 10 seconds.");
      setTimeout(() => this.initializeAccount(true), 10000);
      console.log(e, "Failed to initialize");
    }
  };

  updateLoading(message: string) {
    this.loadingMessage.set(message);
    console.info("[CDP][Init]", message);
  }

  isSafe = async (cdp: CDP) => {
    try {
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      return await cdpInstance.isSafe();
    } catch (e) {
      console.log(e, "Error");
    }
  };

  updateCDPS = async () => {
    const acc = this.account.get();
    const query = `{
      allCups(filter: {lad:{equalTo:"${acc}"}}) {
        nodes {
          lad
          id
          art
          ink
          deleted
        }
      }
    }`;

    const cdpsResponse = await request(
      "https://sai-mainnet.makerfoundation.com/v1",
      query
    );
    // @ts-ignore
    let cdps = cdpsResponse.allCups.nodes;

    if (this.proxy) {
      const proxyQuery = `{
        allCups(filter: {lad:{equalTo:"${this.proxy._address}"}}) {
          nodes {
            lad
            id
            art
            ink
            deleted
          }
        }
      }`;

      const proxyCdpsResponse = await request(
        "https://sai-mainnet.makerfoundation.com/v1",
        proxyQuery
      );
      // @ts-ignore
      const proxyCdps = proxyCdpsResponse.allCups.nodes;
      cdps = cdps.concat(proxyCdps);
    }

    console.log(cdps);
    runInAction(() => {
      this.cdps.replace(
        cdps
          .filter((cdp: RawCDP) => !cdp.deleted)
          .map(
            (cdp: RawCDP) =>
              new CDP(
                cdp.id,
                cdp.ink,
                cdp.art,
                this.prices as IObservableValue<Prices>,
                this.mkrSettings as IObservableValue<MkrSettings>,
                cdp.lad
              )
          )
      );
    });
  };

  updateBalances = async () => {
    const acc = this.account.get();
    const mkr = await this.mkrContract!.methods.balanceOf(acc).call({
      from: acc
    });
    const dai = await this.daiContract!.methods.balanceOf(acc).call({
      from: acc
    });
    const peth = await this.pethContract!.methods.balanceOf(acc).call({
      from: acc
    });
    const ethBalance = await this.web3!.eth.getBalance(acc);

    runInAction(() => {
      this.balances.set(
        new Balances(
          MKR.wei(mkr),
          DAI.wei(dai),
          ETH.wei(ethBalance),
          PETH.wei(peth)
        )
      );
    });
  };

  getApprovals = async () => {
    const acc = this.account.get();
    const mkr = await this.mkrContract!.methods.allowance(
      acc,
      Addresses.TUB
    ).call({
      from: acc
    });
    const dai = await this.daiContract!.methods.allowance(
      acc,
      Addresses.TUB
    ).call({
      from: acc
    });
    const peth = await this.pethContract!.methods.allowance(
      acc,
      Addresses.TUB
    ).call({
      from: acc
    });
    const pethCreator = await this.pethContract!.methods.allowance(
      acc,
      Addresses.Creator
    ).call({
      from: acc
    });

    runInAction(() => {
      this.approvals.set(
        new Approvals(
          MKR.wei(mkr),
          DAI.wei(dai),
          PETH.wei(peth),
          PETH.wei(pethCreator)
        )
      );
    });
  };

  createCDP = async (amountETH: number, amountDAI: number) => {
    const eth = this.web3!.utils.toWei(amountETH.toString(), "ether");
    const dai = amountDAI * Math.pow(10, 18);
    const daiBN = Web3.utils.toBN(dai.toString());

    const cdp = new CDP(
      NEW_CDP_ID--,
      amountETH / this.prices.get()!.wethToPeth,
      amountDAI,
      this.prices as IObservableValue<Prices>,
      this.mkrSettings as IObservableValue<MkrSettings>,
      "0x0000000000000000000000000000000000000000"
    );

    await this.contract!.methods.createCDP(daiBN.toString())
      .send({
        from: this.account.get(),
        value: eth
      })
      .on("transactionHash", (hash: string) => {
        this.cdps.push(cdp);
        this.pendingTxs.set(cdp.id, [hash, "create"]);
      })
      .on("receipt", (receipt: TransactionReceipt) => {
        this.pendingTxs.delete(cdp.id);
      });
    await this.updateCDPS();
    await this.updateBalances();
  };

  drawDAI = async (amountDAI: number, cdp: CDP) => {
    try {
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      this.pendingTxs.set(cdp.id, ["", "draw"]);
      const txMgr = this.maker!.service("transactionManager");
      const draw = cdpInstance.drawDai(amountDAI);

      txMgr.listen(draw, {
        pending: (tx: { hash: string }) => {
          this.pendingTxs.set(cdp.id, [tx.hash, "draw"]);
        },
        confirmed: () => {
          this.pendingTxs.delete(cdp.id);
        }
      });

      await txMgr.confirm(draw);
      await this.updateCDPS();
      await this.updateBalances();
    } catch (e) {
      console.log(e, "Error drawing DAI");
    }
  };

  repayDAI = async (amountDAI: number, cdp: CDP) => {
    try {
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      this.pendingTxs.set(cdp.id, ["", "repay"]);
      const txMgr = this.maker!.service("transactionManager");

      const wipe = cdpInstance.wipeDai(amountDAI);
      txMgr.listen(wipe, {
        pending: (tx: { hash: string }) => {
          this.pendingTxs.set(cdp.id, [tx.hash, "repay"]);
        },
        confirmed: () => {
          this.pendingTxs.delete(cdp.id);
        }
      });

      await txMgr.confirm(wipe);
      await this.updateCDPS();
      await this.updateBalances();
    } catch (e) {
      console.log(e, "Error repaying DAI");
    }
  };

  lockETH = async (amountETH: number, cdp: CDP) => {
    try {
      const eth = this.web3!.utils.toWei(amountETH.toString(), "ether");
      await this.contract!.methods.lockETH(cdp.id)
        .send({
          from: this.account.get(),
          value: eth
        })
        .on("transactionHash", (hash: string) => {
          this.pendingTxs.set(cdp.id, [hash, "lock"]);
        })
        .on("receipt", (receipt: TransactionReceipt) => {
          this.pendingTxs.delete(cdp.id);
        });
      await this.updateCDPS();
      await this.updateBalances();
    } catch (e) {
      console.log(e, "Error locking ETH");
    }
  };

  freeETH = async (amountETH: number, cdp: CDP) => {
    try {
      const peth = amountETH / this.prices.get()!.wethToPeth;
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      this.pendingTxs.set(cdp.id, ["", "free"]);
      const txMgr = this.maker!.service("transactionManager");

      const free = cdpInstance.freePeth(peth);
      txMgr.listen(free, {
        pending: (tx: { hash: string }) => {
          this.pendingTxs.set(cdp.id, [tx.hash, "free"]);
        },
        confirmed: async () => {
          this.pendingTxs.delete(cdp.id);

          try {
            await this.convertPETH(cdp.id, peth);
          } catch (e) {
            console.log(e, "Error Converting PETH");
          }
        }
      });
      await txMgr.confirm(free);
      await this.updateCDPS();
      await this.updateBalances();
    } catch (e) {
      console.log(e, "Error freeing PETH");
    }
  };

  freePETH = async (amountPETH: number, cdp: CDP) => {
    try {
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      await cdpInstance.freePeth(amountPETH);
      await this.updateCDPS();
      await this.updateBalances();
    } catch (e) {
      console.log(e, "Error freeing PETH");
    }
  };

  convertPETH = async (cdp: number | 0, peth: number) => {
    try {
      const pethWei = peth * 10 ** 18;
      this.pethContract!.methods.allowance(
        this.account!.get(),
        Addresses.Creator
      )
        .call({ from: this.account!.get() })
        .then(async allowed => {
          if (Number(allowed) !== 2 ** 256 - 1) {
            this.pendingTxs.set(cdp, ["", "approve"]);
            this.pethContract!.methods.approve(Addresses.Creator)
              .send({ from: this.account.get() })
              .on("transactionHash", (hash: string) => {
                this.pendingTxs.set(cdp, [hash, "approve"]);
              })
              .on("receipt", async (receipt: TransactionReceipt) => {
                this.pendingTxs.delete(cdp);
                this.pendingTxs.set(cdp, ["", "convert"]);
                await this.contract!.methods.convertPETHToETH(
                  pethWei.toString()
                )
                  .send({
                    from: this.account.get()
                  })
                  .on("transactionHash", (hash: string) => {
                    this.pendingTxs.set(cdp, [hash, "convert"]);
                  })
                  .on("receipt", (receipt: TransactionReceipt) => {
                    this.pendingTxs.delete(cdp);
                  });
              });
          } else {
            this.pendingTxs.set(cdp, ["", "convert"]);
            console.log(pethWei);
            await this.contract!.methods.convertPETHToETH(pethWei.toString())
              .send({
                from: this.account.get()
              })
              .on("transactionHash", (hash: string) => {
                this.pendingTxs.set(cdp, [hash, "convert"]);
              })
              .on("receipt", async (receipt: TransactionReceipt) => {
                this.pendingTxs.delete(cdp);
                await this.updateBalances();
              });
          }
        });
    } catch (e) {
      console.log(e, "Error converting PETH");
    }
  };

  shutCDP = async (cdp: CDP) => {
    try {
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      await cdpInstance.shut();
      await this.updateCDPS();
      await this.updateBalances();
    } catch (e) {
      console.log(e, "Error shutting CDP");
    }
  };
}
