import React, { useState } from 'react'
import styled from 'styled-components'
import { Box, Flex, Heading, Skeleton, Link, Image, Text } from '@pancakeswap/uikit'
import { LotteryStatus } from 'config/constants/types'
import PageSection from 'components/PageSection'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import { useFetchLottery, useLottery } from 'state/lottery/hooks'
import useGetNextLotteryEvent from './hooks/useGetNextLotteryEvent'
import useStatusTransitions from './hooks/useStatusTransitions'
import Hero from './components/Hero'
import NextDrawCard from './components/NextDrawCard'
import Countdown from './components/Countdown'
import HistoryTabMenu from './components/HistoryTabMenu'
import YourHistoryCard from './components/YourHistoryCard'
import AllHistoryCard from './components/AllHistoryCard'
import CheckPrizesSection from './components/CheckPrizesSection'
import HowToPlay from './components/HowToPlay'
import HowToPlay2 from './components/HowToPlay2'
import useShowMoreUserHistory from './hooks/useShowMoreUserRounds'

const LotteryPage = styled.div`
  min-height: calc(100vh - 64px);
  overflow: hidden;
  .diag-boundary {
    overflow: unset;
    :before{
      content: "";
      position: absolute;
      width: 150vw;
      top: -100px;
      left: -20vw;
      height: 100%;
      transform: rotate(-5deg);
      background-image: linear-gradient(180deg, #621903, #38100500);
      z-index: -1;
    }
  }
  .diag-bottom {
    overflow: unset;
    :before{
      content: "";
      position: absolute;
      width: 150vw;
      top: -100px;
      left: -20vw;
      height: 200%;
      transform: rotate(-5deg);
      background-image: linear-gradient(180deg, #621903, #38100500);
      z-index: -1;
    }
  }
`
const TimeCircle = styled.div`
  background: #F25615;
  width: 160px;
  height: 160px;
  border-radius: 80px;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  position: relative;
`
const TimeDecoration = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  & img {
    position: absolute;
  }
  & :nth-child(1) {
    left: -20%;
    top: 10%;
  }
  & :nth-child(2) {
    left: -50%;
    top: 40%;
  }
  & :nth-child(3) {
    right: -37%;
    top: 10%;
  }
  & :nth-child(4) {
    left: -25%;
    top: 85%;
  }
  & :nth-child(5) {
    right: -37%;
    top: 72%;
  }
`
const InlineLink = styled(Link)`
  display: inline;
`
const BottomImg = styled(Image)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-100%,-100%);
  @media only screen and (max-width: 600px) {
    display: none;
  }
`
const BlankDiv = styled.div`
  width: 100%;
  @media only screen and (max-width: 600px) {
    display: none;
  }
`
const Lottery = () => {
  useFetchLottery()
  useStatusTransitions()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    currentRound: { status, endTime },
  } = useLottery()
  const [historyTabMenuIndex, setHistoryTabMenuIndex] = useState(0)
  const endTimeAsInt = parseInt(endTime, 10)
  const { nextEventTime, postCountdownText, preCountdownText } = useGetNextLotteryEvent(endTimeAsInt, status)
  const { numUserRoundsRequested, handleShowMoreUserRounds } = useShowMoreUserHistory()

  return (
    <LotteryPage>
      <PageSection background='#F25615' index={1} hasCurvedDivider={false} style={{ padding: 0 }}>
        <Hero />
      </PageSection>
      <PageSection
        // containerProps={{ style: { marginTop: '-30px' } }}
        background='linear-gradient(180deg,#A03313 0%,#381005 100%)'
        concaveDivider
        clipFill={{ light: '#7645D9' }}
        dividerPosition="top"
        index={2}
        hasCurvedDivider={false}
      >
        <Flex alignItems="center" justifyContent="center" flexDirection="column" pt="0px">
          {status === LotteryStatus.OPEN && (
            <Heading scale="xl" color="#ffffff" mb="24px" textAlign="center">
              {t('Get your tickets now!')}
            </Heading>
          )}
          <Flex alignItems="center" justifyContent="center" mb="48px">
            {nextEventTime && (postCountdownText || preCountdownText) ? (
              <TimeCircle id='time-circle'>
                <span style={{ color: 'white' }}>{preCountdownText}</span>
                <Countdown
                  nextEventTime={nextEventTime}
                  postCountdownText={null}
                  preCountdownText={null}
                />
                <span style={{ color: 'white' }}>{postCountdownText}</span>
                <TimeDecoration>
                  <img src="/images/lottery/04.png" width="30px" alt="" />
                  <img src="/images/lottery/02.png" width="40px" alt="" />
                  <img src="/images/lottery/03.png" width="40px" alt="" />
                  <img src="/images/lottery/03.png" width="20px" alt="" />
                  <img src="/images/lottery/02.png" width="25px" alt="" />
                </TimeDecoration>
              </TimeCircle>
            ) : (
              <Skeleton height="41px" width="250px" />
            )}
          </Flex>
          <NextDrawCard />
        </Flex>
      </PageSection>
      <PageSection background='linear-gradient(180deg, #A03313 0%, #A83514 100%)' hasCurvedDivider={false} index={2}>
        <CheckPrizesSection />
      </PageSection>
      <PageSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        background='url(/assets/svgs/PageSVG.svg)'
        style={{
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundColor: '#08060B',
          paddingBottom: 200,
        }}
        hasCurvedDivider={false}
        index={2}
      >
        <Flex width="100%" flexDirection="column" alignItems="center" justifyContent="center">
          <Heading mb="24px" scale="xl">
            {t('Finished Rounds')}
          </Heading>
          <Box mb="24px">
            <HistoryTabMenu
              activeIndex={historyTabMenuIndex}
              setActiveIndex={(index) => setHistoryTabMenuIndex(index)}
            />
          </Box>
          {historyTabMenuIndex === 0 ? (
            <AllHistoryCard />
          ) : (
            <YourHistoryCard
              handleShowMoreClick={handleShowMoreUserRounds}
              numUserRoundsRequested={numUserRoundsRequested}
            />
          )}
        </Flex>
      </PageSection>

      <PageSection
        className='diag-boundary'
        dividerPosition="top"
        dividerFill={{ light: theme.colors.background }}
        clipFill={{ light: '#9A9FD0', dark: '#66578D' }}
        index={2}
        hasCurvedDivider={false}
        background='linear-gradient(180deg,#0c0300 0%,#14090b 100%)'
        style={{paddingTop: 0}}
      >
        <HowToPlay />
      </PageSection>
      <PageSection
        dividerPosition="top"
        dividerFill={{ light: theme.colors.background }}
        clipFill={{ light: '#9A9FD0', dark: '#66578D' }}
        index={2}
        hasCurvedDivider={false}
        background='url(/assets/svgs/PageSVG.svg)'
        style={{
          paddingBottom: 200,
          backgroundSize: 'cover',
          backgroundColor: '#08060B'
        }}
      >
        <HowToPlay2 />
      </PageSection>
      <PageSection
        className='diag-bottom'
        dividerPosition="top"
        dividerFill={{ light: theme.colors.background }}
        clipFill={{ light: '#9A9FD0', dark: '#66578D' }}
        index={2}
        background='linear-gradient(180deg,#08060b 0%,#ef390594 100%)'
        style={{
          padding: 0
        }}
        hasCurvedDivider={false}>
        <Box width="100%">
          <Flex justifyContent="center" alignItems="center" flexDirection="row">
            <BottomImg width={320} height={320} src="/images/lottery/09.png" alt="tombola bunny" mr="8px" mb="16px" />
            <BlankDiv> </BlankDiv>
            <Flex maxWidth="500px" flexDirection="column">
              <Heading mb="16px" scale="md">
                {t('Still got questions?')}
              </Heading>
              <Text>
                {t('Check our in-depth guide on')}{' '}
                {/* <br /> */}
                <InlineLink href="https://app.luchowswap.com/">
                  {t('how to play the LUCHOW lottery!')}
                </InlineLink>
              </Text>
            </Flex>
          </Flex>
        </Box>

      </PageSection>
    </LotteryPage>
  )
}

export default Lottery
