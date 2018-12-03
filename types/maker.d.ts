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

    async getGovernanceFee(currency: typeof Currency): Promise<Currency>;
  }

  class PriceService {
    async getEthPrice(): Promise<Currency>;
    async getMkrPrice(): Promise<Currency>;
    async getWethToPethRatio(): Promise<number>;
  }

  class CDPService {
    async getLiquidationRatio(): Promise<number>;
  }

  class CDPService {
    listen(p: Promise<any>, config: any): void;
    async confirm(p: Propmise<any>): void;
  }

  class Maker {
    static DAI: typeof Currency;
    static ETH: typeof Currency;
    static MKR: typeof Currency;
    static PETH: typeof Currency;
    static WETH: typeof Currency;
    static USD: typeof Currency;

    static create(string: string, options?: any): Maker;

    async authenticate(): void;
    async getCdp(cdpId: number): Promise<CDPInstance>;

    service(service: "price"): PriceService;
    service(service: "cdp"): CDPService;
    service(service: "transactionManager"): TransactionManagerService;
  }

  export default Maker;
}
