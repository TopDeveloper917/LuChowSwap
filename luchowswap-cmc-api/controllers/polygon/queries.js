const gql = require('graphql-tag');
const {blockClient, client} = require("./client");
const GET_BLOCK = gql`
  query blocks($timestamp: BigInt!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gte: $timestamp }
    ) {
      id
      number
      timestamp
    }
  }
`;
const TOP_PAIRS = gql`
  fragment TokenInfo on Token {
    id
    name
    symbol
    derivedBNB
    derivedUSD
  }

  query TopPairs($limit: Int!, $excludeTokenIds: [String!]!) {
    pairs(
      first: $limit
      orderBy: reserveUSD
      orderDirection: desc
      where: { token0_not_in: $excludeTokenIds, token1_not_in: $excludeTokenIds }
    ) {
      id
      token0 {
        ...TokenInfo
      }
      token1 {
        ...TokenInfo
      }
      reserve0
      reserve1
      volumeToken0
      volumeToken1
      reserveBNB
      reserveUSD
    }
  }
`;
const PAIR_BY_ID = gql`
  fragment TokenInfo on Token {
    id
    name
    symbol
    derivedBNB
    derivedUSD
  }

  query Pair($id: ID!) {
    pair(id: $id) {
      id
      token0 {
        ...TokenInfo
      }
      token1 {
        ...TokenInfo
      }
      reserve0
      reserve1
      volumeToken0
      volumeToken1
      reserveBNB
      reserveUSD
    }
  }
`;
const PAIRS_VOLUME_QUERY = gql`
  query PairsVolume($limit: Int!, $pairIds: [ID!]!, $blockNumber: Int!) {
    pairVolumes: pairs(first: $limit, where: { id_in: $pairIds }, block: { number: $blockNumber }) {
      id
      volumeToken0
      volumeToken1
    }
  }
`;
const TOKEN_BY_ADDRESS = gql`
  query Token($id: ID!) {
    token(id: $id) {
      id
      name
      symbol
      derivedBNB
      derivedUSD
    }
  }
`;
async function getBlockFromTimestamp(timestamp) {
    const result = await blockClient.query({
        query: GET_BLOCK,
        variables: {
            timestamp: timestamp,
        },
        fetchPolicy: "cache-first",
    });
    return result?.data?.blocks?.[0]?.number;
}
module.exports = {
    GET_BLOCK, TOP_PAIRS, PAIRS_VOLUME_QUERY, TOKEN_BY_ADDRESS, PAIR_BY_ID,
    getBlockFromTimestamp
};