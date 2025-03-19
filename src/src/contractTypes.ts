export interface InstantiateMsg {
  zero: Record<string, never> | { value: number };
}

export type ExecuteMsg =
  | { inc: Record<string, never> }
  | { dec: Record<string, never> }
  | { set: { value: number } };

export type QueryMsg = { value: Record<string, never> };

export interface CounterResponse {
  value: number;
}