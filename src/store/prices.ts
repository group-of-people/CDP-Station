import { Currency } from "@makerdao/dai";

export default class Prices {
  // FIXME ratio is correct type in reality
  ethPrice: Currency;
  mkrPrice: Currency;
  wethToPeth: number;

  constructor(ethPrice: Currency, mkrPrice: Currency, wethToPeth: number) {
    this.ethPrice = ethPrice;
    this.mkrPrice = mkrPrice;
    this.wethToPeth = wethToPeth;
  }
}
