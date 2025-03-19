export interface PriceResponse {
  decimals: number;
  id: number;
  nonce: number;
  price: {
    block_height: number;
    block_timestamp: string;
    price: string;
  };
}

export interface CurrencyPairsResponse {
  pairs: string[];
}

export interface QueryMsg {
  price?: { base: string; quote: string };
  prices?: { currency_pair_ids: string[] };
  currency_pairs?: object;
}