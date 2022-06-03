import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'LuchowSwap',
  description: 'The most popular AMM on BSC by user count! Earn CAKE through yield farming or win it in the Lottery, then stake it in Syrup Pools to earn more tokens! Initial Farm Offerings (new token launch model pioneered by LuchowSwap), NFTs, and more, on a platform you can trust.',
  image: 'https://app.luchowswap.com/assets/images/banner.jpg',
}

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  let basePath
  if (path.startsWith('/swap')) {
    basePath = '/swap'
  } else if (path.startsWith('/add')) {
    basePath = '/add'
  } else if (path.startsWith('/remove')) {
    basePath = '/remove'
  } else if (path.startsWith('/teams')) {
    basePath = '/teams'
  } else if (path.startsWith('/voting/proposal') && path !== '/voting/proposal/create') {
    basePath = '/voting/proposal'
  } else if (path.startsWith('/nfts/collections')) {
    basePath = '/nfts/collections'
  } else if (path.startsWith('/nfts/profile')) {
    basePath = '/nfts/profile'
  } else if (path.startsWith('/pancake-squad')) {
    basePath = '/pancake-squad'
  } else {
    basePath = path
  }

  switch (basePath) {
    case '/':
      return {
        title: `${t('Home')} | ${t('LuchowSwap')}`,
      }
    case '/swap':
      return {
        title: `${t('Exchange')} | ${t('LuchowSwap')}`,
      }
    case '/add':
      return {
        title: `${t('Add Liquidity')} | ${t('LuchowSwap')}`,
      }
    case '/remove':
      return {
        title: `${t('Remove Liquidity')} | ${t('LuchowSwap')}`,
      }
    case '/liquidity':
      return {
        title: `${t('Liquidity')} | ${t('LuchowSwap')}`,
      }
    case '/find':
      return {
        title: `${t('Import Pool')} | ${t('LuchowSwap')}`,
      }
    case '/competition':
      return {
        title: `${t('Trading Battle')} | ${t('LuchowSwap')}`,
      }
    case '/prediction':
      return {
        title: `${t('Prediction')} | ${t('LuchowSwap')}`,
      }
    case '/prediction/leaderboard':
      return {
        title: `${t('Leaderboard')} | ${t('LuchowSwap')}`,
      }
    case '/farms':
      return {
        title: `${t('Farms')} | ${t('LuchowSwap')}`,
      }
    case '/farms/auction':
      return {
        title: `${t('Farm Auctions')} | ${t('LuchowSwap')}`,
      }
    case '/pools':
      return {
        title: `${t('Pools')} | ${t('LuchowSwap')}`,
      }
    case '/lottery':
      return {
        title: `${t('Lottery')} | ${t('LuchowSwap')}`,
      }
    case '/ifo':
      return {
        title: `${t('Initial Farm Offering')} | ${t('LuchowSwap')}`,
      }
    case '/teams':
      return {
        title: `${t('Leaderboard')} | ${t('LuchowSwap')}`,
      }
    case '/voting':
      return {
        title: `${t('Voting')} | ${t('LuchowSwap')}`,
      }
    case '/voting/proposal':
      return {
        title: `${t('Proposals')} | ${t('LuchowSwap')}`,
      }
    case '/voting/proposal/create':
      return {
        title: `${t('Make a Proposal')} | ${t('LuchowSwap')}`,
      }
    case '/info':
      return {
        title: `${t('Overview')} | ${t('LuchowSwap Info & Analytics')}`,
        description: 'View statistics for LuchowSwap exchanges.',
      }
    case '/info/pools':
      return {
        title: `${t('Pools')} | ${t('LuchowSwap Info & Analytics')}`,
        description: 'View statistics for LuchowSwap exchanges.',
      }
    case '/info/tokens':
      return {
        title: `${t('Tokens')} | ${t('LuchowSwap Info & Analytics')}`,
        description: 'View statistics for LuchowSwap exchanges.',
      }
    case '/nfts':
      return {
        title: `${t('Overview')} | ${t('LuchowSwap')}`,
      }
    case '/nfts/collections':
      return {
        title: `${t('Collections')} | ${t('LuchowSwap')}`,
      }
    case '/nfts/profile':
      return {
        title: `${t('Your Profile')} | ${t('LuchowSwap')}`,
      }
    case '/luchow-squad':
      return {
        title: `${t('Luchow Squad')} | ${t('LuchowSwap')}`,
      }
    default:
      return null
  }
}
