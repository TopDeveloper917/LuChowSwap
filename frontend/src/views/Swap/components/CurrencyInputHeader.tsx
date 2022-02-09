import React from 'react'
import styled from 'styled-components'
import { ChartIcon, Flex, Heading, HistoryIcon, IconButton, NotificationDot, Text, useModal } from '@pancakeswap/uikit'
import TransactionsModal from 'components/App/Transactions/TransactionsModal'
import GlobalSettings from 'components/Menu/GlobalSettings'
import { useExpertModeManager } from 'state/user/hooks'

interface Props {
  title: string
  subtitle: string
  noConfig?: boolean
  setIsChartDisplayed?: React.Dispatch<React.SetStateAction<boolean>>
  isChartDisplayed?: boolean
}

const CurrencyInputContainer = styled(Flex)`
  align-items: center;
  padding: 24px;
  padding: 24px 24px 36px 24px;
  width: 100%;
  background: linear-gradient(to bottom,#a03313 25%,#6c2d19 50%,#7a2308e0 75%,#222222 100%);
`

const CurrencyInputHeader: React.FC<Props> = ({ title, subtitle, setIsChartDisplayed }) => {
  const [expertMode] = useExpertModeManager()
  const toggleChartDisplayed = () => {
    setIsChartDisplayed((currentIsChartDisplayed) => !currentIsChartDisplayed)
  }
  const [onPresentTransactionsModal] = useModal(<TransactionsModal />)

  return (
    <CurrencyInputContainer>
      <Flex width="100%" alignItems="flex-start" justifyContent="space-between">
        {setIsChartDisplayed && (
          <IconButton onClick={toggleChartDisplayed} variant="text" scale="sm">
            <ChartIcon width="24px"/>
          </IconButton>
        )}
        <Flex flexDirection="column" alignItems="center">
          <Heading as="h2" mb="8px">
            {title}
          </Heading>
          <Flex alignItems="center">
            <Text color="textSubtle" fontSize="14px">
              {subtitle}
            </Text>
          </Flex>
        </Flex>
        <Flex>
          <NotificationDot show={expertMode}>
            <GlobalSettings mr="0" />
          </NotificationDot>
          <IconButton onClick={onPresentTransactionsModal} variant="text" scale="sm">
            <HistoryIcon width="24px" />
          </IconButton>
        </Flex>
      </Flex>
    </CurrencyInputContainer>
  )
}

export default CurrencyInputHeader
