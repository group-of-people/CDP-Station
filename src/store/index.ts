/// <reference path="../../types/maker.d.ts" />

import { observable, runInAction, IObservableValue } from "mobx";
import Web3 from "web3";
import Maker, { Currency } from "@makerdao/dai";
import CDPCreatorBuild from "!json-loader!../abi/CDPCreator.abi";
import ERC20 from "!json-loader!../abi/ERC20.abi";
import { ERC20 as ERC20Contract } from "../../types/web3-contracts/ERC20";
import { CDPCreator as CDPCreatorContract } from "../../types/web3-contracts/CDPCreator";
import CDP, { RawCDP } from "./cdp";

import Prices from "./prices";
import MkrSettings from "./mkrSettings";
import Balances from "./balances";

declare global {
  interface Window {
    web3: Web3 | undefined;
  }
}

const { DAI, PETH, MKR, ETH } = Maker;
export { DAI, PETH, MKR, ETH };

// FIXME: remove me
interface Extra {
  wethToPeth: number;
  ethPrice: Currency;
  liquidationRatio: number;
}

export class Store {
  // DATA
  cdps = observable<CDP>([]);
  web3: Web3 | null = null;
  account = observable.box("");
  maker: Maker | null = null;
  loading = observable.box(true);
  locked = observable.box(false);

  prices: IObservableValue<Prices | null> = observable.box(null);
  mkrSettings: IObservableValue<MkrSettings | null> = observable.box(null);
  balances: IObservableValue<Balances | null> = observable.box(null);

  // UI State
  showFreeModal = observable.box(false);
  freeModalTargetCDP = observable.box<CDP | null>(null);
  showLockModal = observable.box(false);
  lockModalTargetCDP = observable.box<CDP | null>(null);
  showNewCDPModal = observable.box(false);
  showDetailsModal = observable.box(false);
  detailsModalTargetCDP = observable.box<CDP | null>(null);
  showRepayModal = observable.box(false);
  repayModalTargetCDP = observable.box<CDP | null>(null);
  showDrawModal = observable.box(false);
  drawModalTargetCDP = observable.box<CDP | null>(null);
  noWeb3 = observable.box(false);

  //contract typings
  contract: CDPCreatorContract | null = null;
  mkrContract: ERC20Contract | null = null;
  daiContract: ERC20Contract | null = null;
  pethContract: ERC20Contract | null = null;

  constructor() {
    var web3 = window.web3;
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== "undefined") {
      web3 = new Web3(web3.currentProvider);

      console.log("Injected web3 detected.");
    } else {
      this.noWeb3.set(true);
      return;
    }
    this.web3 = web3;
    this.contract = new web3.eth.Contract(
      CDPCreatorBuild.abi,
      "0x38753Ef9Fb83C3cC231f91aBD752F4823eD2677F"
    ) as CDPCreatorContract;
    this.mkrContract = new web3.eth.Contract(
      ERC20.abi,
      "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2"
    ) as ERC20Contract;
    this.daiContract = new web3.eth.Contract(
      ERC20.abi,
      "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359"
    ) as ERC20Contract;
    this.pethContract = new web3.eth.Contract(
      ERC20.abi,
      "0xf53AD2c6851052A81B42133467480961B2321C09"
    ) as ERC20Contract;

    this.initializeAccount();
  }

  initializeAccount = async () => {
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
      if (accs[0] === this.account.get()) {
        setTimeout(this.initializeAccount, 500);
        return;
      }
    } catch (e) {
      console.log(e, "Error finding web3.");
      return;
    }

    this.loading.set(true);

    this.maker = Maker.create("browser");

    try {
      await this.maker.authenticate();
      const priceService = this.maker.service("price");
      const cdpService = this.maker.service("cdp");
      const [
        ethPrice,
        mkrPrice,
        wethToPeth,
        liquidationRatio,
        ethBalance
      ] = await Promise.all([
        priceService.getEthPrice(),
        priceService.getMkrPrice(),
        priceService.getWethToPethRatio(),
        cdpService.getLiquidationRatio(),
        web3.eth.getBalance(accs[0])
      ]);

      const mkr = await this.mkrContract!.methods.balanceOf(accs[0]).call({
        from: accs[0]
      });
      const dai = await this.daiContract!.methods.balanceOf(accs[0]).call({
        from: accs[0]
      });
      const peth = await this.pethContract!.methods.balanceOf(accs[0]).call({
        from: accs[0]
      });

      runInAction(() => {
        this.account.set(accs[0]);
        this.prices.set(new Prices(ethPrice, mkrPrice, wethToPeth));
        this.mkrSettings.set(new MkrSettings(liquidationRatio));
        this.balances.set(
          new Balances(
            MKR.wei(mkr),
            DAI.wei(dai),
            ETH.wei(ethBalance),
            PETH.wei(peth)
          )
        );
      });
      await this.updateCDPS();
      runInAction(() => {
        this.loading.set(false);
        this.locked.set(false);
      });
      setTimeout(this.initializeAccount, 500);
    } catch (e) {
      console.log(e, "Failed to initialize");
    }
  };

  isSafe = async (cdp: CDP) => {
    try {
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      return await cdpInstance.isSafe();
    } catch (e) {
      //console.log(e, "Error");
    }
  };

  updateCDPS = async () => {
    const acc = this.account.get();
    const cdpsResponse = await fetch(
      `https://dai-service.makerdao.com/cups/conditions=lad:${acc.toLowerCase()}/sort=cupi:asc`
    );
    const cdps = (await cdpsResponse.json()) as { results: RawCDP[] };

    runInAction(() => {
      this.cdps.replace(
        cdps.results
          .filter(cdp => !cdp.closed)
          .map(
            cdp =>
              new CDP(
                cdp,
                this.prices as IObservableValue<Prices>,
                this.mkrSettings as IObservableValue<MkrSettings>
              )
          )
      );
    });
  };

  createCDP = async (amountETH: number, amountDAI: number) => {
    const eth = this.web3!.utils.toWei(amountETH.toString(), "ether");
    const dai = amountDAI * Math.pow(10, 18);
    const daiBN = Web3.utils.toBN(dai.toString());
    await this.contract!.methods.createCDP(eth, daiBN.toString()).send({
      from: this.account.get(),
      value: eth
    });
    await this.updateCDPS();
  };

  drawDAI = async (amountDAI: number, cdp: CDP) => {
    try {
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      await cdpInstance.drawDai(amountDAI);
      await this.updateCDPS();
    } catch (e) {
      console.log(e, "Error drawing DAI");
    }
  };

  repayDAI = async (amountDAI: number, cdp: CDP) => {
    try {
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      await cdpInstance.wipeDai(amountDAI);
      await this.updateCDPS();
    } catch (e) {
      console.log(e, "Error repaying DAI");
    }
  };

  lockETH = async (amountETH: number, cdp: CDP) => {
    //    console.log(this.web3.utils.fromAscii(cdp.id.toString()));
    try {
      const eth = this.web3!.utils.toWei(amountETH, "ether");
      await this.contract!.methods.lockETH(cdp.id, eth).send({
        from: this.account.get(),
        value: eth
      });
      await this.updateCDPS();
    } catch (e) {
      console.log(e, "Error locking ETH");
    }
  };

  freePETH = async (amountPETH: number, cdp: CDP) => {
    try {
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      await cdpInstance.freePeth(amountPETH);
      await this.updateCDPS();
    } catch (e) {
      console.log(e, "Error freeing PETH");
    }
  };

  shutCDP = async (cdp: CDP) => {
    try {
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      await cdpInstance.shut();
      await this.updateCDPS();
    } catch (e) {
      console.log(e, "Error shutting CDP");
    }
  };

  showFree = (cdp: CDP) => {
    runInAction(() => {
      this.freeModalTargetCDP.set(cdp);
      this.showFreeModal.set(true);
    });
  };

  hideFree = () => {
    runInAction(() => {
      this.freeModalTargetCDP.set(null);
      this.showFreeModal.set(false);
    });
  };

  showLock = (cdp: CDP) => {
    runInAction(() => {
      this.lockModalTargetCDP.set(cdp);
      this.showLockModal.set(true);
    });
  };

  hideLock = () => {
    runInAction(() => {
      this.lockModalTargetCDP.set(null);
      this.showLockModal.set(false);
    });
  };

  showNew = () => {
    runInAction(() => {
      this.showNewCDPModal.set(true);
    });
  };

  hideNew = () => {
    runInAction(() => {
      this.showNewCDPModal.set(false);
    });
  };

  showDetails = (cdp: CDP) => {
    runInAction(() => {
      this.detailsModalTargetCDP.set(cdp);
      this.showDetailsModal.set(true);
    });
  };

  hideDetails = () => {
    runInAction(() => {
      this.detailsModalTargetCDP.set(null);
      this.showDetailsModal.set(false);
    });
  };

  showRepay = (cdp: CDP) => {
    runInAction(() => {
      this.repayModalTargetCDP.set(cdp);
      this.showRepayModal.set(true);
    });
  };

  hideRepay = () => {
    runInAction(() => {
      this.repayModalTargetCDP.set(null);
      this.showRepayModal.set(false);
    });
  };

  showDraw = (cdp: CDP) => {
    runInAction(() => {
      this.drawModalTargetCDP.set(cdp);
      this.showDrawModal.set(true);
    });
  };

  hideDraw = () => {
    runInAction(() => {
      this.drawModalTargetCDP.set(null);
      this.showDrawModal.set(false);
    });
  };
}
