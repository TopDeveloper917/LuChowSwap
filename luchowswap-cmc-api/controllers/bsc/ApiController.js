let BaseController = require('../BaseController');
const { getAddress } = require("@ethersproject/address");
const BigNumber = require("bignumber.js");
const {blockClient, client, BLACKLIST} = require("./client");
const {
    GET_BLOCK, TOP_PAIRS, PAIRS_VOLUME_QUERY, TOKEN_BY_ADDRESS, PAIR_BY_ID,
    getBlockFromTimestamp
} = require("./queries");
const TOP_PAIR_LIMIT = 1000;

module.exports = BaseController.extend({
    name: "BaseController",
    getTopPairs: async function () {
        const epochSecond = Math.round(new Date().getTime() / 1000);
        const firstBlock = await getBlockFromTimestamp(epochSecond - 86400);
        if (!firstBlock) {
            throw new Error("Failed to fetch blocks from the subgraph");
        }
        const {data: {pairs}, errors: topPairsErrors} = await client.query({
            query: TOP_PAIRS,
            variables: {
                limit: TOP_PAIR_LIMIT,
                excludeTokenIds: BLACKLIST,
            },
            fetchPolicy: "cache-first",
        });
        if (topPairsErrors && topPairsErrors.length > 0) {
            throw new Error("Failed to fetch pairs from the subgraph");
        }

        const {
            data: {pairVolumes}, errors: yesterdayVolumeErrors
        } = await client.query({
            query: PAIRS_VOLUME_QUERY,
            variables: {
                limit: TOP_PAIR_LIMIT,
                pairIds: pairs.map((pair) => pair.id),
                blockNumber: +firstBlock,
            },
            fetchPolicy: "cache-first",
        });
        if (yesterdayVolumeErrors && yesterdayVolumeErrors.length > 0) {
            throw new Error(`Failed to get volume info for 24h ago from the subgraph`);
        }
        const yesterdayVolumeIndex =
            pairVolumes?.reduce((memo, pair) => {
                memo[pair.id] = {
                    volumeToken0: new BigNumber(pair.volumeToken0),
                    volumeToken1: new BigNumber(pair.volumeToken1),
                };
                return memo;
            }, {}) ?? {};
        return (
            pairs?.map((pair) => {
                    const yesterday = yesterdayVolumeIndex[pair.id];
                    return {
                        ...pair,
                        price:
                            pair.reserve0 !== "0" && pair.reserve1 !== "0"
                                ? new BigNumber(pair.reserve1).dividedBy(pair.reserve0).toString()
                                : "0",
                        previous24hVolumeToken0:
                            pair.volumeToken0 && yesterday?.volumeToken0
                                ? new BigNumber(pair.volumeToken0).minus(yesterday.volumeToken0).toString()
                                : new BigNumber(pair.volumeToken0).toString(),
                        previous24hVolumeToken1:
                            pair.volumeToken1 && yesterday?.volumeToken1
                                ? new BigNumber(pair.volumeToken1).minus(yesterday.volumeToken1).toString()
                                : new BigNumber(pair.volumeToken1).toString(),
                    };
                }
            ) ?? []
        );
    },
    getTokenByAddress: async function (address) {
        const {data: { token }, errors: tokenErrors} = await client.query({
            query: TOKEN_BY_ADDRESS,
            variables: {
                id: address,
            },
            fetchPolicy: "cache-first",
        });

        if (tokenErrors && tokenErrors.length > 0) {
            throw new Error("Failed to fetch token from subgraph");
        }

        return token;
    },
    getPairById: async function (address) {
        const {data: { pair }, errors: pairErrors} = await client.query({
            query: PAIR_BY_ID,
            variables: {
                id: address,
            },
            fetchPolicy: "cache-first",
        });

        if (pairErrors && pairErrors.length > 0) {
            throw new Error("Failed to fetch pair from subgraph");
        }

        return pair;
    },
    summary: async function (req, res, next) {
        const that = this;
        try {
            const topPairs = await that.getTopPairs();
            const pairs = topPairs.reduce((accumulator, pair) => {
                const t0Id = getAddress(pair.token0.id);
                const t1Id = getAddress(pair.token1.id);
                accumulator[`${t0Id}_${t1Id}`] = {
                    price: pair.price,
                    base_volume: pair.volumeToken0,
                    quote_volume: pair.volumeToken1,
                    liquidity: pair.reserveUSD,
                    liquidity_BNB: pair.reserveBNB,
                };
                return accumulator;
            }, {});
            return res.status(200).send({updated_at: new Date().getTime(), data: pairs});
        } catch (error) {
            console.log("summary error: ", error);
            return res.status(500).send(error);
        }
    },
    tokens: async function (req, res, next) {
        const that = this;
        try {
            const topPairs = await that.getTopPairs();
            const tokens = topPairs.reduce((accumulator, pair) => {
                for (const token of [pair.token0, pair.token1]) {
                    const tId = getAddress(token.id);
                    accumulator[tId] = {
                        name: token.name,
                        symbol: token.symbol,
                        price: token.derivedUSD,
                        price_BNB: token.derivedBNB,
                    };
                }
                return accumulator;
            }, {});
            return res.status(200).send({ updated_at: new Date().getTime(), data: tokens });
        } catch (error) {
            console.log("tokens error: ", error);
            return res.status(500).send(error);
        }
    },
    tokensFromAddress: async function (req, res, next) {
        if (!req.params.address || typeof req.params.address !== "string" || !req.params.address.match(/^0x[0-9a-fA-F]{40}$/)) {
            return res.status(400).send("Invalid address");
        }
        const that = this;
        try {
            const address = getAddress(req.params.address);
            const token = await that.getTokenByAddress(address.toLowerCase());
            return res.status(200).send({
                updated_at: new Date().getTime(),
                data: {
                    name: token?.name,
                    symbol: token?.symbol,
                    price: token?.derivedUSD,
                    price_BNB: token?.derivedBNB,
                },
            });
        } catch (error) {
            return res.status(500).send(error);
        }
    },
    pairs: async function (req, res, next) {
        const that = this;
        try {
            const topPairs = await that.getTopPairs();
            const pairs = topPairs.reduce((accumulator, pair) => {
                const pId = getAddress(pair.id);
                const t0Id = getAddress(pair.token0.id);
                const t1Id = getAddress(pair.token1.id);
                accumulator[`${t0Id}_${t1Id}`] = {
                    pair_address: pId,
                    base_name: pair.token0.name,
                    base_symbol: pair.token0.symbol,
                    base_address: t0Id,
                    quote_name: pair.token1.name,
                    quote_symbol: pair.token1.symbol,
                    quote_address: t1Id,
                    price: pair.price,
                    base_volume: pair.previous24hVolumeToken0,
                    quote_volume: pair.previous24hVolumeToken1,
                    liquidity: pair.reserveUSD,
                    liquidity_BNB: pair.reserveBNB,
                };
                return accumulator;
            }, {});
            return res.status(200).send({ updated_at: new Date().getTime(), data: pairs });
        } catch (error) {
            return res.status(500).send(error);
        }
    },
    pairsFromAddress: async function (req, res, next) {
        if (!req.params.address || typeof req.params.address !== "string" || !req.params.address.match(/^0x[0-9a-fA-F]{40}$/)) {
            return res.status(400).send("Invalid address");
        }
        const that = this;
        try {
            const address = getAddress(req.params.address);
            const pair = await that.getPairById(address.toLowerCase());
            const pId = getAddress(pair.id);
            const t0Id = getAddress(pair.token0.id);
            const t1Id = getAddress(pair.token1.id);
            return res.status(200).send({
                updated_at: new Date().getTime(),
                data: {
                    pair_address: pId,
                    base_name: pair.token0.name,
                    base_symbol: pair.token0.symbol,
                    base_address: t0Id,
                    quote_name: pair.token1.name,
                    quote_symbol: pair.token1.symbol,
                    quote_address: t1Id,
                    price: pair.price,
                    base_volume: pair.previous24hVolumeToken0,
                    quote_volume: pair.previous24hVolumeToken1,
                    liquidity: pair.reserveUSD,
                    liquidity_BNB: pair.reserveBNB,
                },
            });
        } catch (error) {
            return res.status(500).send(error);
        }
    },
});