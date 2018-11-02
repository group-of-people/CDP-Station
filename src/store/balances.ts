import { Currency } from "@makerdao/dai";

export default class Balances {
  mkrBalance: Currency;
  daiBalance: Currency;
  ethBalance: Currency;
  pethBalance: Currency;

  constructor(
    mkrBalance: Currency,
    daiBalance: Currency,
    ethBalance: Currency,
    pethBalance: Currency
  ) {
    this.mkrBalance = mkrBalance;
    this.daiBalance = daiBalance;
    this.ethBalance = ethBalance;
    this.pethBalance = pethBalance;
  }
}
