import React from 'react'
import styled, { keyframes } from 'styled-components'
import { Box, Flex, Heading, Skeleton } from '@pancakeswap/uikit'
import { LotteryStatus } from 'config/constants/types'
import { useTranslation } from 'contexts/Localization'
import { usePriceLuchowBusd } from 'state/farms/hooks'
import { useLottery } from 'state/lottery/hooks'
import { getBalanceNumber } from 'utils/formatBalance'
import Balance from 'components/Balance'
import { TicketPurchaseCard } from '../svgs'
import BuyTicketsButton from './BuyTicketsButton'

const floatingStarsLeft = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(10px, 10px);
  }
  to {
    transform: translate(0, -0px);
  }  
`

const floatingStarsRight = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(-10px, 10px);
  }
  to {
    transform: translate(0, -0px);
  }  
`

const floatingTicketLeft = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(-10px, 15px);
  }
  to {
    transform: translate(0, -0px);
  }  
`

const floatingTicketRight = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(10px, 15px);
  }
  to {
    transform: translate(0, -0px);
  }  
`

const mainTicketAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(6deg);
  }
  to {
    transform: rotate(0deg);
  }  
`

const TicketContainer = styled(Flex)`
  // animation: ${mainTicketAnimation} 3s ease-in-out infinite;
  padding: 0;
`

const PrizeTotalBalance = styled(Balance)`
  background: ${({ theme }) => theme.colors.gradients.gold};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const StyledBuyTicketButton = styled(BuyTicketsButton) <{ disabled: boolean }>`
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled : 'linear-gradient(180deg, #f7ef00 0%, #ff8205 100%)'};
  width: 160px;
  ${({ theme }) => theme.mediaQueries.xs} {
    width: 180px;
  };
  box-shadow: 2px 4px #7e6969;
`
const ButtonWrapper = styled.div`
  z-index: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-0deg);
`
const Decorations = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: url(/images/lottery/back01.png);
  background-repeat: no-repeat;
  background-position: center 0;
  background-size: cover;
  z-index: -1;
`
const StarsDecorations = styled(Box)`
  position: absolute;
  width: 100%;
  height: 100%;

  & img {
    position: absolute;
  }

  & :nth-child(1) {
    animation: ${floatingStarsLeft} 3s ease-in-out infinite;
    animation-delay: 0.25s;
  }
  & :nth-child(2) {
    animation: ${floatingStarsLeft} 3.5s ease-in-out infinite;
    animation-delay: 0.5s;
  }
  & :nth-child(3) {
    animation: ${floatingStarsRight} 4s ease-in-out infinite;
    animation-delay: 0.75s;
  }
  & :nth-child(4) {
    animation: ${floatingTicketLeft} 6s ease-in-out infinite;
    animation-delay: 0.2s;
  }
  & :nth-child(5) {
    animation: ${floatingTicketRight} 6s ease-in-out infinite;
  }
  & :nth-child(6) {
    animation: ${floatingTicketLeft} 6s ease-in-out infinite;
    animation-delay: 0.4s;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    & :nth-child(1) {
      left: 15%;
      top: 20%;
    }
    & :nth-child(2) {
      left: 16%;
      top: 30%;
    }
    & :nth-child(3) {
      right: 17%;
      top: 19%;
    }
    & :nth-child(4) {
      left: 15%;
      top: 45%;
    }
    & :nth-child(5) {
      right: 17%;
      top: 42%;
    }
    & :nth-child(6) {
      right: 15%;
      top: 31%;
    }
  }

  ${({ theme }) => theme.mediaQueries.md} {
    & :nth-child(1) {
      left: 29%;
      top: 20%;
    }
    & :nth-child(2) {
      left: 30%;
      top: 30%;
    }
    & :nth-child(3) {
      right: 31%;
      top: 19%;
    }
    & :nth-child(4) {
      left: 29%;
      top: 45%;
    }
    & :nth-child(5) {
      right: 31%;
      top: 42%;
    }
    & :nth-child(6) {
      right: 29%;
      top: 31%;
    }
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    & :nth-child(1) {
      left: 34%;
      top: 20%;
    }
    & :nth-child(2) {
      left: 35%;
      top: 30%;
    }
    & :nth-child(3) {
      right: 36%;
      top: 19%;
    }
    & :nth-child(4) {
      left: 34%;
      top: 45%;
    }
    & :nth-child(5) {
      right: 36%;
      top: 42%;
    }
    & :nth-child(6) {
      right: 34%;
      top: 31%;
    }
  }
`

const Hero = () => {
  const { t } = useTranslation()
  const {
    currentRound: { amountCollectedInCake, status },
    isTransitioning,
  } = useLottery()

  const cakePriceBusd = usePriceLuchowBusd()
  const prizeInBusd = amountCollectedInCake.times(cakePriceBusd)
  const prizeTotal = getBalanceNumber(prizeInBusd)
  const ticketBuyIsDisabled = status !== LotteryStatus.OPEN || isTransitioning

  const getHeroHeading = () => {
    if (status === LotteryStatus.OPEN) {
      return (
        <>
          <Heading mb="0px" scale="lg" color="#ffffff" style={{ textTransform: 'uppercase' }}>
            {t('luchow lottery')}
          </Heading>
          {prizeInBusd.isNaN() ? (
            <Skeleton my="7px" height={60} width={190} />
          ) : (
            <PrizeTotalBalance fontSize="64px" bold prefix="$" value={prizeTotal} mb="0px" decimals={2} />
          )}
          <Heading mb="0px" scale="md" color="#ffffff" style={{ textTransform: 'uppercase' }}>
            {t('in prizes!')}
          </Heading>
        </>
      )
    }
    return (
      <Heading mb="0px" scale="xl" color="#ffffff">
        {t('Tickets on sale soon')}
      </Heading>
    )
  }

  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center">
      <Decorations />
      <StarsDecorations display={['none', 'none', 'block']}>
        <img src="/images/lottery/04.png" width="30px" alt="" />
        <img src="/images/lottery/03.png" width="40px" alt="" />
        <img src="/images/lottery/01.png" width="50px" alt="" />
        <img src="/images/lottery/02.png" width="50px" alt="" />
        <img src="/images/lottery/02.png" width="35px" alt="" />
        <img src="/images/lottery/04.png" width="30px" alt="" />
      </StarsDecorations>
      {getHeroHeading()}
      <div>
        <img src='/images/lottery/00.png' alt='Buy Ticket' style={{ height: 120 }} />
      </div>
      <TicketContainer
        position="relative"
        width={['240px', '288px']}
        height={['94px', '113px']}
        alignItems="center"
        justifyContent="center"
      >
        <ButtonWrapper>
          <StyledBuyTicketButton disabled={ticketBuyIsDisabled} />
        </ButtonWrapper>
        {/* <TicketSvgWrapper>
          <TicketPurchaseCard width="100%" />
        </TicketSvgWrapper> */}
      </TicketContainer>
    </Flex>
  )
}

export default Hero
