import React from 'react'
import { Heading, Flex, Text, Skeleton, ChartIcon, CommunityIcon, SwapIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useGetStats } from 'hooks/api'
import useTheme from 'hooks/useTheme'
import { formatLocalisedCompactNumber } from 'utils/formatBalance'
import IconCard, { IconCardData } from '../IconCard'
import StatCardContent from './StatCardContent'
import GradientLogo from '../GradientLogoSvg'

// Values fetched from bitQuery effective 6/9/21
const tvlData = 20569
const txCount = 41921
const addressCount = 624

const Stats = () => {
  const { t } = useTranslation()
  const data = useGetStats()
  const { theme } = useTheme()

  // const tvlString = data ? formatLocalisedCompactNumber(data.tvl) : '-'
  const tvlString = data ? formatLocalisedCompactNumber(tvlData) : '-'
  const trades = formatLocalisedCompactNumber(txCount)
  const users = formatLocalisedCompactNumber(addressCount)

  const tvlText = t('And those users are now entrusting the platform with over $%tvl% in funds.', { tvl: tvlString })
  // const tvlText = t('And those users are now entrusting the platform with over $12 billion in funds.')
  const [entrusting, inFunds] = tvlText.split(tvlString)

  const UsersCardData: IconCardData = {
    icon: <CommunityIcon color="secondary" width="36px" />,
  }

  const TradesCardData: IconCardData = {
    icon: <SwapIcon color="primary" width="36px" />,
  }

  const StakedCardData: IconCardData = {
    icon: <ChartIcon color="failure" width="36px" />,
  }

  return (
    <Flex justifyContent="center" alignItems="center" flexDirection="column">
      {/* <GradientLogo height="48px" width="48px" mb="24px" /> */}
      <img src='/assets/images/logo.png' alt='logo' style={{ height: 64, width: 64, marginBottom: 24 }} />
      <Heading textAlign="center" scale="xl">
        {t('Used by many.')}
      </Heading>
      <Heading textAlign="center" scale="xl" mb="32px">
        {t('Trusted with thousands.')}
      </Heading>
      <Text textAlign="center" color="textSubtle">
        {t('LuchowSwap is the decentralized exchange of LunaChow (LUCHOW) token.')}
      </Text>
      <Flex flexWrap="wrap">
        <Text display="inline" textAlign="center" color="textSubtle" mb="20px">
          {t('LuchowSwap provide a platform where users can provide liquidity and swap for different tokens on Binance Smart Chain.')}
          {/* {entrusting}
          <>{data ? <>{tvlString}</> : <Skeleton display="inline-block" height={16} width={70} mt="2px" />}</>
          {inFunds} */}
        </Text>
      </Flex>

      <Text textAlign="center" color="primary" bold mb="32px">
        {t('Will you join them?')}
      </Text>

      <Flex flexDirection={['column', null, null, 'row']}>
        <IconCard {...UsersCardData} background='linear-gradient(to bottom,#e24717 0%,#491200 100%)' mr={[null, null, null, '16px']} mb={['16px', null, null, '0']}>
          <StatCardContent
            headingText={t('%users% users', { users })}
            bodyText={t('in the last 30 days')}
            highlightColor={theme.colors.secondary}
          />
        </IconCard>
        <IconCard {...TradesCardData} background='linear-gradient(to bottom,#e24717 0%,#491200 100%)' mr={[null, null, null, '16px']} mb={['16px', null, null, '0']}>
          <StatCardContent
            headingText={t('%trades% trades', { trades })}
            bodyText={t('made in the last 30 days')}
            highlightColor={theme.colors.primary}
          />
        </IconCard>
        <IconCard {...StakedCardData} background='linear-gradient(to bottom,#e24717 0%,#491200 100%)'>
          <StatCardContent
            headingText={t('$%tvl% staked', { tvl: tvlString })}
            bodyText={t('Total Value Locked')}
            highlightColor={theme.colors.failure}
          />
        </IconCard>
      </Flex>
    </Flex>
  )
}

export default Stats
