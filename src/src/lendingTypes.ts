export interface InstantiateMsg {
    supported_tokens: string[];
}

export interface DepositMsg {
    days: string;
    interest: string;
}

export interface WithdrawMsg {
    amount: string;
    denom: string;
}

export interface TakeDepositMsg {
    depositor: string;
    denom: string;
    collateral: string;
}

export type ExecuteMsg = 
    | { deposit: DepositMsg }
    | { withdraw: WithdrawMsg }
    | { take_loan: TakeDepositMsg };

export interface BalanceQuery {
    address: string;
    denom: string;
}

export interface AllBalancesQuery {
    address: string;
}

export type QueryMsg = 
    | { balance: BalanceQuery }
    | { all_balances: AllBalancesQuery }
    | { all_depositors: object };

export interface BalanceResponse {
    balance: string;
}

export interface AllBalancesResponse {
    balances: Coin[];
}

export interface Coin {
    denom: string;
    amount: string;
}

export interface DepositorInfo {
    address: string;
    denom: string;
    days: string;
    interest_rate: string;
    amount: string;
}

export interface AllDepositorsResponse {
    depositors: DepositorInfo[];
}