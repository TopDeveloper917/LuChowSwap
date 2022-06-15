import { serializeTokens } from './tokens'
import { SerializedPoolConfig, PoolCategory } from './types'

const serializedTokens = serializeTokens()

const pools: SerializedPoolConfig[] = [
  {
    sousId: 0,
    stakingToken: serializedTokens.mloky,
    earningToken: serializedTokens.mloky,
    contractAddress: {
      97: '',
      56: '0x0cC73B1B05A2b8ACaCa1e31e635B50634a9881FF',
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '0.1',
    sortOrder: 1,
    isFinished: true,
  },
  {
    sousId: 1,
    stakingToken: serializedTokens.luchow,
    earningToken: serializedTokens.mloky,
    contractAddress: {
      97: '',
      56: '0x4319a5FEa245522D5016705f52910b4aB9F4D6A8',
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '0.1',
    sortOrder: 1,
    isFinished: true,
  },
  {
    sousId: 2,
    stakingToken: serializedTokens.luchow,
    earningToken: serializedTokens.mloky,
    contractAddress: {
      97: '',
      56: '0xceF722E1277977e4a153Fd2f35030b84bf38Bb64',
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '0.1',
    sortOrder: 1,
    isFinished: true,
  },
  {
    sousId: 3,
    stakingToken: serializedTokens.luchow,
    earningToken: serializedTokens.mloky,
    contractAddress: {
      97: '',
      56: '0x3631C2738945A544C42F6B06A353F0f35984377a',
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '0.1',
    sortOrder: 1,
    isFinished: false,
  }
]

export default pools
