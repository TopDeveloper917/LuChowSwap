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
    isFinished: false,
  }
]

export default pools
