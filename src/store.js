import { observable, runInAction } from "mobx";
import Maker from "@makerdao/dai";
import CDPCreatorBuild from "./utils/CDPCreator.json";
import ERC20 from "./utils/ERC20.json";
import getWeb3 from "./utils/getWeb3";

const maker = Maker.create("browser");
const { DAI, PETH, MKR } = Maker;

function humanizeCDPResponse(cdp, props) {
  const pethLocked = PETH.wei(cdp.ink);
  const daiDebt = DAI.wei(cdp.art);
  const daiLocked =
    pethLocked.toNumber() * props.wethToPeth * props.ethPrice.toNumber();
  const daiAvailable = daiLocked / props.liquidationRatio - daiDebt.toNumber();
  const collateralization =
    (pethLocked.toNumber() * props.wethToPeth * props.ethPrice.toNumber()) / daiDebt.toNumber() * 100;

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
  cdps = observable([]);
  web3 = observable.box(null);
  account = observable.box("");
  maker = observable.box(null);
  loading = observable.box(true);
  ethPrice = observable.box(null);
  mkrPrice = observable.box(null);
  wethToPeth = observable.box(null);
  liquidationRatio = observable.box(null);

  constructor() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3.then(web3 => {
      this.web3 = web3;
      this.contract = new web3.eth.Contract(
        CDPCreatorBuild.abi,
        "0x940bF0EE39db2F9b2f85059725216e3898372222"
      );
      this.mkrContract = new web3.eth.Contract(
        ERC20.abi,
        "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2"
      )
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
        cdpsResponse
      ] = await Promise.all([
        priceService.getEthPrice(),
        priceService.getMkrPrice(),
        priceService.getWethToPethRatio(),
        cdpService.getLiquidationRatio(),
        fetch(
          `https://dai-service.makerdao.com/cups/conditions=lad:${accs[0].toLowerCase()}/sort=cupi:asc`
        )
      ]);
      const cdps = await cdpsResponse.json();
      const mkrBalance = await this.mkrContract.methods.balanceOf(accs[0]).call({ from: accs[0] });

      runInAction(() => {
        this.account.set(accs[0]);
        this.ethPrice.set(ethPrice);
        this.mkrPrice.set(mkrPrice);
        this.wethToPeth.set(wethToPeth);
        this.liquidationRatio.set(liquidationRatio);
        this.loading.set(false);
        this.cdps.replace(
          cdps.results.map(cdp =>
            humanizeCDPResponse(cdp, {
              wethToPeth,
              liquidationRatio,
              ethPrice,
            })
          )
        );
        this.mkrBalance = mkrBalance;
      });
    } catch (e) {
      console.log(e, "Failed to initialize maker");
    }
  };

  createCDP = async (amountETH, amountDAI) => {
    const eth = this.web3.utils.toWei(amountETH.toString(), "ether");
    const dai = amountDAI * Math.pow(10, 18);
    const daiBN = new this.web3.utils.BN(dai.toString());
    await this.contract.methods
      .createCDP(eth, daiBN.toString())
      .send({ from: this.account.get(), value: eth });
  };

  drawDAI = async (amountDAI, cdp) => {
    try {
      const cdpInstance = await this.maker.getCdp(cdp.id);
      await cdpInstance.drawDai(amountDAI);
    } catch (e) {
      console.log(e, 'Error drawing DAI');
    }
  };

  repayDAI = async (amountDAI, cdp) => {
    try {
      const cdpInstance = await this.maker.getCdp(cdp.id);
      await cdpInstance.wipeDai(amountDAI);
    } catch (e) {
      console.log(e.message, 'Error repaying DAI');
    }
  }
}

export default new Store();
