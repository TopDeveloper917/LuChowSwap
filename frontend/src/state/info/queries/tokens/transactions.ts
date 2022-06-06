import { request, gql } from 'graphql-request'
import { INFO_CLIENT } from 'config/constants/endpoints'
import { Transaction } from 'state/info/types'
import { MintResponse, SwapResponse, BurnResponse } from 'state/info/queries/types'
import { mapMints, mapBurns, mapSwaps } from 'state/info/queries/helpers'

/**
 * Data to display transaction table on Token page
 */
const PAIRS_INCLUDE_TOKEN = gql`
  query pairsIncludeToken($address: Bytes!) {
    pairsAs0: pairs(first: 100, orderBy: timestamp, orderDirection: desc, where: { token0: $address }) {
      id
    }
    pairsAs1: pairs(first: 100, orderBy: timestamp, orderDirection: desc, where: { token1: $address }) {
      id
    }
  }
`
const TOKEN_TRANSACTIONS = gql`
  query tokenTransactions($pairs: [Bytes!]!) {
    mintsAs0: mints(first: 10, orderBy: timestamp, orderDirection: desc, where: { pair_in: $pairs }) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to
      amount0
      amount1
      amountUSD
    }
    swapsAs0: swaps(first: 10, orderBy: timestamp, orderDirection: desc, where: { pair_in: $pairs }) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      from
      amount0In
      amount1In
      amount0Out
      amount1Out
      amountUSD
    }
    burnsAs0: burns(first: 10, orderBy: timestamp, orderDirection: desc, where: { pair_in: $pairs }) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      amount0
      amount1
      amountUSD
    }
  }
`
interface TransactionResults {
  mintsAs0: MintResponse[]
  swapsAs0: SwapResponse[]
  burnsAs0: BurnResponse[]
}
const fetchTokenTransactions = async (address: string): Promise<{ data?: Transaction[]; error: boolean }> => {
  const pairs = [];
  try {
    const pairData = await request(INFO_CLIENT, PAIRS_INCLUDE_TOKEN, {address});
    for (let i = 0; i < pairData.pairsAs0.length; i++) {
      if (!pairs.includes(pairData.pairsAs0[i].id)) pairs.push(pairData.pairsAs0[i].id)
    }
    for (let j = 0; j < pairData.pairsAs1.length; j++) {
      if (!pairs.includes(pairData.pairsAs1[j].id)) pairs.push(pairData.pairsAs1[j].id)
    }
  } catch (error) {
    console.log("Failed to get pairs from token: ", error)
  }
  try {
    const data = await request<TransactionResults>(INFO_CLIENT, TOKEN_TRANSACTIONS, {
      pairs,
    })
    const mints0 = data.mintsAs0.map(mapMints)

    const burns0 = data.burnsAs0.map(mapBurns)

    const swaps0 = data.swapsAs0.map(mapSwaps)

    return { data: [...mints0, ...burns0, ...swaps0], error: false }
  } catch (error) {
    console.error(`Failed to fetch transactions for token ${address}`, error)
    return {
      error: true,
    }
  }
}

export default fetchTokenTransactions
