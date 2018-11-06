/// <reference path="../../types/maker.d.ts" />

import { observable, runInAction, IObservableValue } from "mobx";
import Web3 from "web3";
import Maker, { Currency } from "@makerdao/dai";
import CDPCreatorBuild from "!json-loader!../abi/CDPCreator.abi";
import ERC20 from "!json-loader!../abi/ERC20.abi";
import DSToken from "!json-loader!../abi/DSToken.abi";
import { DSToken as DSTokenContract } from "../../types/web3-contracts/DSToken";
import { ERC20 as ERC20Contract } from "../../types/web3-contracts/ERC20";
import { CDPCreator as CDPCreatorContract } from "../../types/web3-contracts/CDPCreator";
import CDP, { RawCDP } from "./cdp";

import Prices from "./prices";
import MkrSettings from "./mkrSettings";
import Balances from "./balances";
import Addresses from "./addresses.json";

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
  noWeb3 = observable.box(false);

  //contract typings
  contract: CDPCreatorContract | null = null;
  mkrContract: ERC20Contract | null = null;
  daiContract: ERC20Contract | null = null;
  pethContract: DSTokenContract | null = null;

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
      Addresses.Creator
    ) as CDPCreatorContract;
    this.mkrContract = new web3.eth.Contract(
      ERC20.abi,
      Addresses.MKR
    ) as ERC20Contract;
    this.daiContract = new web3.eth.Contract(
      ERC20.abi,
      Addresses.DAI
    ) as ERC20Contract;
    this.pethContract = new web3.eth.Contract(
      DSToken.abi,
      Addresses.PETH
    ) as DSTokenContract;

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
        liquidationRatio
      ] = await Promise.all([
        priceService.getEthPrice(),
        priceService.getMkrPrice(),
        priceService.getWethToPethRatio(),
        cdpService.getLiquidationRatio()
      ]);

      runInAction(() => {
        this.account.set(accs[0]);
        this.prices.set(new Prices(ethPrice, mkrPrice, wethToPeth));
        this.mkrSettings.set(new MkrSettings(liquidationRatio));
      });
      await this.updateBalances();
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
      console.log(e, "Error");
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
                cdp.cupi,
                cdp.ink,
                cdp.art,
                this.prices as IObservableValue<Prices>,
                this.mkrSettings as IObservableValue<MkrSettings>
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

  createCDP = async (amountETH: number, amountDAI: number) => {
    const eth = this.web3!.utils.toWei(amountETH.toString(), "ether");
    const dai = amountDAI * Math.pow(10, 18);
    const daiBN = Web3.utils.toBN(dai.toString());
    await this.contract!.methods.createCDP(daiBN.toString()).send({
      from: this.account.get(),
      value: eth
    });
    await this.updateCDPS();
    await this.updateBalances();
  };

  drawDAI = async (amountDAI: number, cdp: CDP) => {
    try {
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      await cdpInstance.drawDai(amountDAI);
      await this.updateCDPS();
      await this.updateBalances();
    } catch (e) {
      console.log(e, "Error drawing DAI");
    }
  };

  repayDAI = async (amountDAI: number, cdp: CDP) => {
    try {
      const cdpInstance = await this.maker!.getCdp(cdp.id);
      await cdpInstance.wipeDai(amountDAI);
      await this.updateCDPS();
      await this.updateBalances();
    } catch (e) {
      console.log(e, "Error repaying DAI");
    }
  };

  lockETH = async (amountETH: number, cdp: CDP) => {
    try {
      const eth = this.web3!.utils.toWei(amountETH.toString(), "ether");
      await this.contract!.methods.lockETH(cdp.id).send({
        from: this.account.get(),
        value: eth
      });
      await this.updateCDPS();
      await this.updateBalances();
    } catch (e) {
      console.log(e, "Error locking ETH");
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

  convertPETH = async () => {
    try {
      const balances = this.balances.get();
      const peth = balances!.pethBalance;
      const pethWei = peth.toNumber() * 10 ** 18;
      this.pethContract!.methods.allowance(
        this.account!.get(),
        Addresses.Creator
      )
        .call({ from: this.account!.get() })
        .then(async allowed => {
          if (Number(allowed) !== 2 ** 256 - 1) {
            this.pethContract!.methods.approve(Addresses.Creator)
              .send({ from: this.account.get() })
              .then(async () => {
                await this.contract!.methods.convertPETHToETH(
                  peth.toNumber()
                ).send({ from: this.account.get() });
              });
          } else {
            await this.contract!.methods.convertPETHToETH(
              pethWei.toString()
            ).send({ from: this.account.get() });
          }
        });
      await this.updateBalances();
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
