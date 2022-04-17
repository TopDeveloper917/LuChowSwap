import { serializeTokens } from './tokens'
import { SerializedFarmConfig } from './types'

const serializedTokens = serializeTokens()

const farms: SerializedFarmConfig[] = [
  /**
   * These 3 farms (PID 0, 251, 252) should always be at the top of the file.
   */
  {
    pid: 0,
    lpSymbol: 'MLOKY',
    lpAddresses: {
      97: '',
      56: '0xF71E950758310faF9f7D51C4F4250C7546086C1f',
    },
    token: serializedTokens.mloky,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 1,
    lpSymbol: 'LUCHOW-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x1076FCc4dd5f2679F4DeFd2FBf8c7B6fB03C57f2',
    },
    token: serializedTokens.luchow,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 2,
    lpSymbol: 'BUSD-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x9F809199515C66e1616158B4018a22B84a7dd0B8',
    },
    token: serializedTokens.busd,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 3,
    lpSymbol: 'MLOKY-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x1e026a6985819e6023B3A8D5e83D7e7492b157fc',
    },
    token: serializedTokens.mloky,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 4,
    lpSymbol: 'MLOKY-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x0F55cb5E2E646b2EF3C145348d1B2679dD63f795',
    },
    token: serializedTokens.mloky,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 5,
    lpSymbol: 'MLOKY-BUSD LP',
    lpAddresses: {
      97: '',
      56: '0x60Be11a4af998ED01e9F7f270c10EA0C3dFb4284',
    },
    token: serializedTokens.mloky,
    quoteToken: serializedTokens.busd,
  },
  {
    pid: 6,
    lpSymbol: 'MLOKY-USDC LP',
    lpAddresses: {
      97: '',
      56: '0x07842F811ef313D3cdd4A0bAc2E8Fd4A6dA59A59',
    },
    token: serializedTokens.mloky,
    quoteToken: serializedTokens.usdc,
  },
  {
    pid: 7,
    lpSymbol: 'MLOKY-LUCHOW LP',
    lpAddresses: {
      97: '',
      56: '0xe547E3D899E28fCa8E391edcdEdED679055AC650',
    },
    token: serializedTokens.mloky,
    quoteToken: serializedTokens.luchow,
  },
  {
    pid: 8,
    lpSymbol: 'LUCHOW-BUSD LP',
    lpAddresses: {
      97: '',
      56: '0xf046c9C810A99c6ac77987D36e32484A829CFFAD',
    },
    token: serializedTokens.luchow,
    quoteToken: serializedTokens.busd,
  },
  {
    pid: 9,
    lpSymbol: 'LUCHOW-USDC LP',
    lpAddresses: {
      97: '',
      56: '0xb2dd44e45347EAFE21B2b7C883f1648d7EDD8608',
    },
    token: serializedTokens.luchow,
    quoteToken: serializedTokens.usdc,
  }
]

export default farms
