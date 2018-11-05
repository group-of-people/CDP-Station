declare module "@makerdao/dai" {
  export interface Currency {
    // FIXME stricter types
    static wei(amount: any): Currency;
    (): Currency;

    toNumber(): number;
    toString(): string;
    toString(decimals: number): string;
  }

  class CDPInstance {
    async isSafe(): boolean;
    async drawDai(amount: number): void;
    async wipeDai(amount: number): void;
    async freePeth(amount: number): void;
    async shut(): void;

    async getGovernanceFee(currency: typeof Currency): Promise<Currency>
  }

  class PriceService {
    getEthPrice(): Currency;
    getMkrPrice(): Currency;
    getWethToPethRatio(): number;
  }

  class CDPService {
    getLiquidationRatio(): number;
  }

  class Maker {
    static DAI: typeof Currency;
    static ETH: typeof Currency;
    static MKR: typeof Currency;
    static PETH: typeof Currency;
    static WETH: typeof Currency;
    static USD: typeof Currency;

    static create(string: string): Maker;

    async authenticate(): void;
    async getCdp(cdpId: number): Promise<CDPInstance>;

    service(service: "price"): PriceService;
    service(service: "cdp"): CDPService;
  }

  export default Maker;
}
