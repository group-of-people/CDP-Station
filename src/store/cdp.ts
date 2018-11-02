import { observable, IObservableValue, computed } from "mobx";
import Maker, { Currency } from "@makerdao/dai";

import MkrSettings from "./mkrSettings";
import Prices from "./prices";

const { DAI, PETH } = Maker;

export interface RawCDP {
  ink: number;
  art: number;
  cupi: number;
  closed: boolean;
}

export default class CDP {
  id: number;
  pethLocked: IObservableValue<Currency>;
  daiDebt: IObservableValue<Currency>;

  prices: IObservableValue<Prices>;
  mkrSettings: IObservableValue<MkrSettings>;

  constructor(
    cdp: RawCDP,
    prices: IObservableValue<Prices>,
    mkrSettings: IObservableValue<MkrSettings>
  ) {
    this.id = cdp.cupi;
    this.pethLocked = observable.box(PETH.wei(cdp.ink));
    this.daiDebt = observable.box(DAI.wei(cdp.art));
    this.prices = prices;
    this.mkrSettings = mkrSettings;
  }

  ethLocked = computed(() => {
    return this.pethLocked.get().toNumber() * this.prices.get().wethToPeth;
  });

  daiLocked = computed(() => {
    return (
      this.pethLocked.get().toNumber() *
      this.prices.get().wethToPeth *
      this.prices.get().ethPrice.toNumber()
    );
  });

  daiAvailable = computed(() => {
    return (
      this.daiLocked.get() / this.mkrSettings.get().liquidationRatio -
      this.daiDebt.get().toNumber()
    );
  });

  collateralization = computed(() => {
    return (
      ((this.pethLocked.get().toNumber() *
        this.prices.get().wethToPeth *
        this.prices.get().ethPrice.toNumber()) /
        this.daiDebt.get().toNumber()) *
      100
    );
  });
}
