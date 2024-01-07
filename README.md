# SingleSidedLiquidity-Frontend

To install & run locally:

```
npm i
npm run dev
```

There's a deployed SingleSidedLiquidity contract on [Polygon](https://polygonscan.com/address/0x9fbbf71f22855ecb34d646077f95fa9a121aed1f) that the frontend uses.

## Purpose

The purpose of this frontend is to create and monitor single sided Uniswap V3 liquidity positions. It's an experiment to see if providing liquidity in a full range with rebalancing is better than single sided liquidity while simply re-ranging.

Pros of full range: always active fee generation, low number of transactions
Cons of full range: rebalancing costs (slippage), swap fees, impermanent loss

Pros of single sided: no rebalancing costs, no swap fees, concentrated position
Cons of single sided: many transactions, much of time outside of active fee generation, less impermanent loss

### Ideas

To minimax the outcome, I chose Polygon. The main benefits are low transaction fees and low(ish) TVL in the pools. This allows us to be a larger percentage of the liquidity pool while paying $0.01 or less for each transaction.

This frontend may be used in combination with the keeper (bot) or reranged manually.