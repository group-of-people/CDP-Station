import { observable, runInAction } from "mobx";
import Maker from "@makerdao/dai";
import CDPCreatorBuild from "./utils/CDPCreator.json";
import getWeb3 from "./utils/getWeb3";

const maker = Maker.create("browser");
const { DAI, PETH } = Maker;

function humanizeCDPResponse(cdp, props) {
  const pethLocked = PETH.wei(cdp.ink);
  const daiDebt = DAI.wei(cdp.art);
  const daiLocked =
    pethLocked.toNumber() * props.wethToPeth * props.ethPrice.toNumber();
  const daiAvailable = daiLocked / props.liquidationRatio - daiDebt.toNumber();

  return {
    id: cdp.cupi,
    daiAvailable,
    daiDebt,
    daiLocked,
    pethLocked,
    ethLocked: pethLocked.toNumber() * props.wethToPeth
  };
}

class Store {
  cdps = observable([]);
  web3 = observable.box(null);
  account = observable.box("");
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
      this.initializeAccount().then(() => {
        web3.currentProvider.publicConfigStore.on(
          "update",
          this.initializeAccount
        );
      });
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
      await maker.authenticate();
      const priceService = maker.service("price");
      const cdpService = maker.service("cdp");
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
              ethPrice
            })
          )
        );
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
}

export default new Store();
