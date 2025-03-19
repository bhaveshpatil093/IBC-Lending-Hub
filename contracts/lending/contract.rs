use cosmwasm_std::StdError;
use cosmwasm_std::{
    entry_point, to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo,
    Response, StdResult, Uint128, BankMsg, Coin,
};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_json_wasm;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub supported_tokens: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    Deposit { days: String, interest: String },
    Withdraw { amount: Uint128, denom: String },
    TakeLoan { depositor: String, denom: String, collateral: Uint128 },
    //RepayLoan { borrower: String, denom: String, amount: Uint128 },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    Balance { address: String, denom: String },
    AllBalances { address: String },
    AllDepositors,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct BalanceResponse {
    pub balance: Uint128,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct AllBalancesResponse {
    pub balances: Vec<Coin>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct DepositorInfo {
    pub address: String,
    pub denom: String,
    pub days: String,
    pub interest: String,
    pub amount: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct AllDepositorsResponse {
    pub depositors: Vec<DepositorInfo>,
}

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    deps.storage.set(
        b"supported_tokens",
        &serde_json_wasm::to_vec(&msg.supported_tokens)
            .map_err(|err| StdError::generic_err(format!("Serialization error: {:?}", err)))?,
    );
    Ok(Response::default())
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    match msg {
        ExecuteMsg::Deposit { days, interest } => execute_deposit(deps, info, days, interest),
        ExecuteMsg::Withdraw { amount, denom } => execute_withdraw(deps, env, info, amount, denom),
        ExecuteMsg::TakeLoan { depositor, denom, collateral } => execute_take_loan(deps, info, depositor, denom, collateral),
        //ExecuteMsg::RepayLoan { borrower, denom, amount } => execute_repay_loan(deps, info, borrower, denom, amount),
    }
}

pub fn execute_deposit(
    deps: DepsMut,
    info: MessageInfo,
    days: String,
    interest: String,
) -> StdResult<Response> {
    let supported_tokens: Vec<String> = serde_json_wasm::from_slice(
        &deps.storage.get(b"supported_tokens").unwrap_or_default(),
    )
    .map_err(|err| StdError::generic_err(format!("Deserialization error: {:?}", err)))?;

    let mut attributes = vec![
        ("action".to_string(), "deposit".to_string()),
        ("days".to_string(), days.clone()),
        ("interest".to_string(), interest.clone()),
    ];

    for coin in info.funds.iter() {
        if !supported_tokens.contains(&coin.denom) {
            return Err(StdError::generic_err(format!("Unsupported token: {}", coin.denom)));
        }

        let key = format!("{}:{}", info.sender, coin.denom);
        let balance_bytes = deps.storage.get(key.as_bytes()).unwrap_or_default();
        let mut balance = if balance_bytes.is_empty() {
            0u128
        } else {
            u128::from_be_bytes(
                balance_bytes
                    .try_into()
                    .map_err(|_| StdError::generic_err("Failed to convert balance bytes"))?,
            )
        };

        balance += coin.amount.u128();
        deps.storage.set(key.as_bytes(), &balance.to_be_bytes());

        // Store interest, days, and amount
        let deposit_info_key = format!("deposit_info:{}:{}", info.sender, coin.denom);
        let deposit_info = (days.clone(), interest.clone(), coin.amount.to_string());
        deps.storage.set(deposit_info_key.as_bytes(), &serde_json_wasm::to_vec(&deposit_info)
            .map_err(|err| StdError::generic_err(format!("Serialization error: {:?}", err)))?);

        attributes.push((format!("deposit_{}", coin.denom), coin.amount.to_string()));
    }

    Ok(Response::new().add_attributes(attributes))
}

pub fn execute_take_loan(
    deps: DepsMut,
    info: MessageInfo,
    depositor: String,
    denom: String,
    collateral: Uint128,
) -> StdResult<Response> {
    let supported_tokens: Vec<String> = serde_json_wasm::from_slice(
        &deps.storage.get(b"supported_tokens").unwrap_or_default(),
    )
    .map_err(|err| StdError::generic_err(format!("Deserialization error: {:?}", err)))?;

    if !supported_tokens.contains(&denom) {
        return Err(StdError::generic_err(format!("Unsupported token: {}", denom)));
    }

    let deposit_key = format!("{}:{}", depositor, denom);
    let deposit_balance_bytes = deps.storage.get(deposit_key.as_bytes()).unwrap_or_default();
    let deposit_balance = if deposit_balance_bytes.is_empty() {
        0u128
    } else {
        u128::from_be_bytes(deposit_balance_bytes.try_into().map_err(|_| StdError::generic_err("Failed to convert balance bytes"))?)
    };

    if deposit_balance == 0 {
        return Err(StdError::generic_err("No deposit available"));
    }

    // Ensure the taker has provided the collateral
    /*
    let collateral_provided = info.funds.iter().find(|coin| coin.denom == denom && coin.amount == collateral);
    if collateral_provided.is_none() {
        return Err(StdError::generic_err("Collateral not provided or insufficient"));
    }*/

    // Store the collateral information
    let collateral_key = format!("collateral:{}:{}", info.sender, denom);
    deps.storage.set(collateral_key.as_bytes(), &collateral.u128().to_be_bytes());

    // Withdraw the deposit and send it to the depositor
    let new_deposit_balance = deposit_balance - collateral.u128();
    deps.storage.set(deposit_key.as_bytes(), &new_deposit_balance.to_be_bytes());

    let withdraw_msg = BankMsg::Send {
        to_address: depositor.clone(),
        amount: vec![Coin {
            denom: denom.clone(),
            amount: Uint128::from(collateral),
            //amount: Uint128::from(deposit_balance),collateral
        }],
    };

    Ok(Response::new()
        .add_message(withdraw_msg)
        .add_attribute("action", "take_deposit")
        .add_attribute("depositor", depositor)
        .add_attribute("denom", denom)
        .add_attribute("collateral", collateral.to_string()))
}

pub fn execute_withdraw(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    amount: Uint128,
    denom: String,
) -> StdResult<Response> {
    let supported_tokens: Vec<String> = serde_json_wasm::from_slice(
        &deps.storage.get(b"supported_tokens").unwrap_or_default(),
    )
    .map_err(|err| StdError::generic_err(format!("Deserialization error: {:?}", err)))?;

    if !supported_tokens.contains(&denom) {
        return Err(StdError::generic_err(format!("Unsupported token: {}", denom)));
    }

    let key = format!("{}:{}", info.sender, denom);
    let balance_bytes = deps.storage.get(key.as_bytes()).unwrap_or_default();
    let balance = if balance_bytes.is_empty() {
        0u128
    } else {
        u128::from_be_bytes(balance_bytes.try_into().map_err(|_| StdError::generic_err("Failed to convert balance bytes"))?)
    };

    if balance < amount.u128() {
        return Err(StdError::generic_err("Insufficient funds"));
    }

    let new_balance = balance - amount.u128();
    deps.storage.set(key.as_bytes(), &new_balance.to_be_bytes());

    let msg = BankMsg::Send {
        to_address: info.sender.to_string(),
        amount: vec![Coin {
            denom: denom.clone(),
            amount,
        }],
    };

    Ok(Response::new()
        .add_message(msg)
        .add_attribute("action", "withdraw")
        .add_attribute("amount", amount.to_string())
        .add_attribute("denom", denom))
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Balance { address, denom } => { to_json_binary(&query_balance(deps, address, denom)?)}
        QueryMsg::AllBalances { address } => to_json_binary(&query_all_balances(deps, address)?),
        QueryMsg::AllDepositors => to_json_binary(&query_all_depositors(deps)?),
    }
}

fn query_balance(deps: Deps, address: String, denom: String) -> StdResult<BalanceResponse> {
    let address = deps.api.addr_validate(&address)?;
    let key = format!("{}:{}", address, denom);
    let balance_bytes = deps.storage.get(key.as_bytes()).unwrap_or_default();
    let balance = if balance_bytes.is_empty() {
        0u128
    } else {
        u128::from_be_bytes(balance_bytes.try_into().map_err(|_| StdError::generic_err("Failed to convert balance bytes"))?)
    };
    Ok(BalanceResponse {
        balance: Uint128::from(balance),
    })
}

fn query_all_balances(deps: Deps, address: String) -> StdResult<AllBalancesResponse> {
    let address = deps.api.addr_validate(&address)?;
    let supported_tokens: Vec<String> = serde_json_wasm::from_slice(
        &deps.storage.get(b"supported_tokens").unwrap_or_default(),
    )
    .map_err(|err| StdError::generic_err(format!("Deserialization error: {:?}", err)))?;

    let mut balances = Vec::new();
    for denom in supported_tokens {
        let key = format!("{}:{}", address, denom);
        let balance_bytes = deps.storage.get(key.as_bytes()).unwrap_or_default();
        let balance = if balance_bytes.is_empty() {
            0u128
        } else {
            u128::from_be_bytes(balance_bytes.try_into().unwrap())
        };
        if balance > 0 {
            balances.push(Coin {
                denom,
                amount: Uint128::from(balance),
            });
        }
    }

    Ok(AllBalancesResponse { balances })
}

fn query_all_depositors(deps: Deps) -> StdResult<AllDepositorsResponse> {
    let supported_tokens: Vec<String> = serde_json_wasm::from_slice(
        &deps.storage.get(b"supported_tokens").unwrap_or_default(),
    )
    .map_err(|err| StdError::generic_err(format!("Deserialization error: {:?}", err)))?;

    let mut depositors = Vec::new();
    for denom in supported_tokens {
        let prefix = format!("deposit_info:{}:", denom);
        let keys = deps.storage.range(Some(prefix.as_bytes()), None, cosmwasm_std::Order::Ascending);
        for (key, value) in keys {
            let address = String::from_utf8(key.to_vec()).map_err(|err| StdError::generic_err(format!("UTF-8 conversion error: {:?}", err)))?;
            let (days, interest, amount): (String, String, String) = serde_json_wasm::from_slice(&value).map_err(|err| StdError::generic_err(format!("Deserialization error: {:?}", err)))?;
            depositors.push(DepositorInfo {
                address,
                denom: denom.clone(),
                days,
                interest,
                amount,
            });
        }
    }

    Ok(AllDepositorsResponse { depositors })
}
