import { observable, runInAction } from "mobx";
import Maker from "@makerdao/dai";
import CDPCreatorBuild from "./utils/CDPCreator.json";
import ERC20 from "./utils/ERC20.json";
import getWeb3 from "./utils/getWeb3";

const maker = Maker.create("browser");
const { DAI, PETH, MKR, ETH } = Maker;
export { DAI, PETH, MKR, ETH };

function humanizeCDPResponse(cdp, props) {
  const pethLocked = PETH.wei(cdp.ink);
  const daiDebt = DAI.wei(cdp.art);
  const daiLocked =
    pethLocked.toNumber() * props.wethToPeth * props.ethPrice.toNumber();
  const daiAvailable = daiLocked / props.liquidationRatio - daiDebt.toNumber();
  const collateralization =
    ((pethLocked.toNumber() * props.wethToPeth * props.ethPrice.toNumber()) /
      daiDebt.toNumber()) *
    100;

  return {
    id: cdp.cupi,
    daiAvailable,
    daiDebt,
    daiLocked,
    pethLocked,
    ethLocked: pethLocked.toNumber() * props.wethToPeth,
    collateralization: collateralization.toFixed(2)
  };
}

class Store {
  // DATA
  cdps = observable([]);
  web3 = observable.box(null);
  account = observable.box("");
  maker = null;
  loading = observable.box(true);
  ethPrice = observable.box(null);
  mkrPrice = observable.box(null);
  wethToPeth = observable.box(null);
  liquidationRatio = observable.box(null);
  mkrBalance = observable.box(null);
  daiBalance = observable.box(null);
  ethBalance = observable.box(null);
  pethBalance = observable.box(null);

  // UI State
  showFreeModal = observable.box(false);
  freeModalTargetCDP = observable.box(null);
  showLockModal = observable.box(false);
  lockModalTargetCDP = observable.box(null);

  constructor() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3.then(web3 => {
      this.web3 = web3;
      this.contract = new web3.eth.Contract(
        CDPCreatorBuild.abi,
        "0x38753Ef9Fb83C3cC231f91aBD752F4823eD2677F"
      );
      this.mkrContract = new web3.eth.Contract(
        ERC20.abi,
        "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2"
      );
      this.daiContract = new web3.eth.Contract(
        ERC20.abi,
        "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359"
      );
      this.pethContract = new web3.eth.Contract(
        ERC20.abi,
        "0xf53AD2c6851052A81B42133467480961B2321C09"
      );
      this.initializeAccount().then(() => {
        web3.currentProvider.publicConfigStore.on(
          "update",
          this.initializeAccount
        );
      });
      this.maker = maker;
    });
  }

  initializeAccount = async () => {
    let web3 = this.web3;

    let accs;
    try {
      accs = await web3.eth.getAccounts();
      if (accs.length === 0) {
        return;
      }
      if (accs[0] === this.account.get()) return;
    } catch (e) {
      console.log(e, "Error finding web3.");
      return;
    }

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

      const mkr = await this.mkrContract.methods
        .balanceOf(accs[0])
        .call({ from: accs[0] });
      const dai = await this.daiContract.methods
        .balanceOf(accs[0])
        .call({ from: accs[0] });
      const peth = await this.pethContract.methods
        .balanceOf(accs[0])
        .call({ from: accs[0] });

      runInAction(() => {
        this.account.set(accs[0]);
        this.ethPrice.set(ethPrice);
        this.mkrPrice.set(mkrPrice);
        this.wethToPeth.set(wethToPeth);
        this.liquidationRatio.set(liquidationRatio);
        this.mkrBalance.set(MKR.wei(mkr));
        this.daiBalance.set(DAI.wei(dai));
        this.ethBalance.set(ETH.wei(ethBalance));
        this.pethBalance.set(PETH.wei(peth));
      });
      await this.updateCDPS();
      runInAction(() => {
        this.loading.set(false);
      });
    } catch (e) {
      console.log(e, "Failed to initialize");
    }
  };

  isSafe = async cdp => {
    try {
      const cdpInstance = await this.maker.getCdp(cdp.id);
      return await cdpInstance.isSafe;
    } catch (e) {
      //console.log(e, "Error");
    }
  };

  updateCDPS = async () => {
    const acc = this.account.get();
    const cdpsResponse = await fetch(
      `https://dai-service.makerdao.com/cups/conditions=lad:${acc.toLowerCase()}/sort=cupi:asc`
    );
    const cdps = await cdpsResponse.json();

    runInAction(() => {
      this.cdps.replace(
        cdps.results.filter(cdp => !cdp.closed).map(cdp =>
          humanizeCDPResponse(cdp, {
            wethToPeth: this.wethToPeth.get(),
            liquidationRatio: this.liquidationRatio.get(),
            ethPrice: this.ethPrice.get()
          })
        )
      );
    });
  };

  createCDP = async (amountETH, amountDAI) => {
    const eth = this.web3.utils.toWei(amountETH.toString(), "ether");
    const dai = amountDAI * Math.pow(10, 18);
    const daiBN = new this.web3.utils.BN(dai.toString());
    await this.contract.methods
      .createCDP(eth, daiBN.toString())
      .send({ from: this.account.get(), value: eth });
    await this.updateCDPS();
  };

  drawDAI = async (amountDAI, cdp) => {
    try {
      const cdpInstance = await this.maker.getCdp(cdp.id);
      await cdpInstance.drawDai(amountDAI);
    } catch (e) {
      console.log(e, "Error drawing DAI");
    }
  };

  repayDAI = async (amountDAI, cdp) => {
    try {
      const cdpInstance = await this.maker.getCdp(cdp.id);
      await cdpInstance.wipeDai(amountDAI);
    } catch (e) {
      console.log(e, "Error repaying DAI");
    }
  };

  lockETH = async (amountETH, cdp) => {
    console.log(this.web3.utils.fromAscii(cdp.id.toString()));
    try {
      const eth = this.web3.utils.toWei(amountETH, "ether");
      await this.contract.methods
        .lockETH(cdp.id, eth)
        .send({ from: this.account.get(), value: eth });
    } catch (e) {
      console.log(e, "Error locking ETH");
    }
  };

  freePETH = async (amountPETH, cdp) => {
    try {
      const cdpInstance = await this.maker.getCdp(cdp.id);
      await cdpInstance.freePeth(amountPETH);
    } catch (e) {
      console.log(e, "Error freeing PETH");
    }
  };

  shutCDP = async cdp => {
    try {
      const cdpInstance = await this.maker.getCdp(cdp.id);
      await cdpInstance.shut();
    } catch (e) {
      console.log(e, "Error shutting CDP");
    }
  };

  showFree = cdp => {
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

  showLock = cdp => {
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
}

export default new Store();
