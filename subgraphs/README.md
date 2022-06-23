# LuchowSwap Subgraph
TheGraph exposes a GraphQL endpoint to query the events and entities within the Binance Smart Chain and LuchowSwap ecosystem.  
Currently, there are multiple subgraphs, but additional subgraphs can be added to this repository, following the current architecture.  
We are using TheGraph service and our own Graph Node for specific subgraph. In the future, we will launch the all subgraphs in our Graph Node 
to increase the speed and flexiable.  

### Subgraphs
1. **[Blocks](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/blocks)**: Tracks all blocks on Binance Smart Chain.  
2. **[Exchange](https://api.thegraph.com/subgraphs/name/chenxiwang177/luchow-info/graphql)**: Tracks all PancakeSwap Exchange data with price, volume, liquidity, 
pairs, tokens, mint, burn, swap, ...  
4. **[Lottery](https://subgraph.luchowswap.com/subgraphs/name/luchow-lottery/graphql)**: Tracks all PancakeSwap Lottery with rounds, draws and tickets.
