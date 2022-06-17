import React from 'react'
import styled from 'styled-components'
import { Box, Flex, Text, Heading, useMatchBreakpoints, Link } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import { BallWithNumber, PoolAllocationChart } from '../svgs'

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBorder};
  height: 1px;
  margin: 40px 0;
  width: 100%;
`
const BulletList = styled.ul`
  list-style-type: none;
  margin-left: 8px;
  padding: 0;
  li {
    margin: 0;
    padding: 0;
  }
  li::before {
    content: '•';
    margin-right: 4px;
    color: ${({ theme }) => theme.colors.textSubtle};
  }
  li::marker {
    font-size: 12px;
  }
`
const StyledStepCard = styled(Box)`
  display: flex;
  align-self: baseline;
  position: relative;
  background: white;
  padding: 1px 1px 3px 1px;
  border-radius: ${({ theme }) => theme.radii.card};
`
const StepCardInner = styled(Box)`
  width: 100%;
  padding: 24px;
  background: white;
  border-radius: ${({ theme }) => theme.radii.card};
`
const BallsContainer = styled(Flex)`
  gap: 6.5px;
  padding-left: 7px;
  align-items: center;
  width: 100%;
`
const InlineLink = styled(Link)`
  display: inline;
`
const ExampleBalls = () => {
  const { isDesktop } = useMatchBreakpoints()
  const ballSize = isDesktop ? '24px' : '32px'
  const fontSize = isDesktop ? '18px' : '24px'
  return (
    <BallsContainer>
      <BallWithNumber size={ballSize} fontSize={fontSize} color="yellow" number="8" />
      <BallWithNumber size={ballSize} fontSize={fontSize} color="green" number="3" />
      <BallWithNumber size={ballSize} fontSize={fontSize} color="aqua" number="1" />
      <BallWithNumber size={ballSize} fontSize={fontSize} color="teal" number="9" />
      <BallWithNumber size={ballSize} fontSize={fontSize} color="lilac" number="3" />
      <BallWithNumber size={ballSize} fontSize={fontSize} color="pink" number="2" />
    </BallsContainer>
  )
}
const MatchExampleContainer = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 5fr;
  grid-template-rows: 46px 64px 64px;
`
const StyledMatchExampleA = styled.img`
  // width: auto;
  // height: 64px;
  margin-top: 20px;
  @media only screen and (max-width: 575px) {
    // height: 56px;
  }
  @media only screen and (max-width: 369px) {
    // height: 46px;
  }
`
const StyledMatchExampleB = styled.img`
  // width: auto;
  // height: 58px;
  margin-top: 20px;
  @media only screen and (max-width: 575px) {
    // height: 52px;
  }
  @media only screen and (max-width: 369px) {
    // height: 42px;
  }
`
const MatchExampleCard = () => {
  const { isDark } = useTheme()
  const { isXs } = useMatchBreakpoints()
  const { t } = useTranslation()
  const exampleWidth = isXs ? '210px' : '258px'
  return (
    <StyledStepCard width={['280px', '330px', '380px']}>
      <StepCardInner height="220px">
        <MatchExampleContainer>
          <Box />
          <ExampleBalls />
          <Text lineHeight="72px" textAlign="right" color="primary" bold mr="20px">
            {t('A')}
          </Text>
          <StyledMatchExampleA src='/assets/images/lottery-example-a.png' />
          <Text lineHeight="72px" textAlign="right" color="primary" bold mr="20px">
            {t('B')}
          </Text>
          {/* <MatchExampleB width={exampleWidth} height="46px" isDark={isDark} /> */}
          <StyledMatchExampleB src='/assets/images/lottery-example-b.png' />
        </MatchExampleContainer>
      </StepCardInner>
    </StyledStepCard>
  )
}
const AllocationGrid = styled.div`
  display: grid;
  grid-template-columns: 4fr 1fr;
  grid-auto-rows: max-content;
  row-gap: 4px;
`
const AllocationColorCircle = styled.div<{ color: string }>`
  border-radius: 50%;
  width: 7px;
  height: 7px;
  margin-right: 12px;
  background-color: ${({ color }) => color};
`
const AllocationMatch: React.FC<{ color: string; text: string }> = ({ color, text }) => {
  return (
    <Flex alignItems="center">
      <AllocationColorCircle color={color} />
      <Text color="black" fontSize='14px'>{text}</Text>
    </Flex>
  )
}

const PoolAllocations = () => {
  const { t } = useTranslation()
  return (
    <StyledStepCard width={['280px', '330px', '380px']}>
      <StepCardInner height="auto">
        <Flex mb="32px" justifyContent="center">
          <PoolAllocationChart width="100px" height="100px" />
        </Flex>
        <Flex mb="12px" justifyContent="space-between">
          <Text fontSize="12px" color='black' bold textTransform="uppercase">
            {t('Digits matched')}
          </Text>
          <Text fontSize="12px" color='black' bold textAlign="right" textTransform="uppercase">
            {t('Prize pool allocation')}
          </Text>
        </Flex>
        <AllocationGrid>
          <AllocationMatch color="black" text={t('Matches first %digits%', { digits: 1 })} />
          <Text textAlign="right" color='primary' fontSize='14px'>
            2%
          </Text>
          <AllocationMatch color="#F7421E" text={t('Matches first %digits%', { digits: 2 })} />
          <Text textAlign="right" color='primary' fontSize='14px'>
            3%
          </Text>
          <AllocationMatch color="#B74324" text={t('Matches first %digits%', { digits: 3 })} />
          <Text textAlign="right" color='primary' fontSize='14px'>
            5%
          </Text>
          <AllocationMatch color="#DF7E6C" text={t('Matches first %digits%', { digits: 4 })} />
          <Text textAlign="right" color='primary' fontSize='14px'>
            10%
          </Text>
          <AllocationMatch color="#EEA817" text={t('Matches first %digits%', { digits: 5 })} />
          <Text textAlign="right" color='primary' fontSize='14px'>
            15%
          </Text>
          <AllocationMatch color="#F15514" text={t('Matches all 6')} />
          <Text textAlign="right" color='primary' fontSize='14px'>
            45%
          </Text>
          <AllocationMatch color="#F4A48B" text={t('Burn/Treasury')} />
          <Text textAlign="right" color='primary' fontSize='14px'>
            20%
          </Text>
        </AllocationGrid>
      </StepCardInner>
    </StyledStepCard>
  )
}

const GappedFlex = styled(Flex)`
  gap: 24px;
`

const HowToPlay2: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box width="100%">
      <Flex flex="2" mb="24px" flexDirection="column" style={{ textAlign: 'center' }}>
        <Heading mb="24px" scale="xl" color="secondary">
          {t('Winning Criteria')}
        </Heading>
        <Heading mb="24px" scale="md">
          {t('The digits on your ticket must match in the correct order to win.')}
        </Heading>
      </Flex>
      <GappedFlex flexDirection={['column', 'column', 'column', 'row']}>
        <Flex flex="2" flexDirection="column">
          <Text mb="16px" color="primary">
            {t('Here’s an example lottery draw, with two tickets, A and B.')}
          </Text>
          <BulletList>
            <Text display="inline" color="text">
              1. {t(
                'Ticket A: The first 3 digits and the last 2 digits match, but the 4th digit is wrong, so this ticket only wins a “Match first 3” prize.',
              )}
            </Text>
            <br />
            <Text display="inline" color="text">
              2. {t(
                'Ticket B: Even though the last 5 digits match, the first digit is wrong, so this ticket doesn’t win a prize.',
              )}
            </Text>
          </BulletList>
          <Text mt="16px" color="primary">
            {t(
              'Prize brackets don’t ‘stack’: if you match the first 3 digits in order, you’ll only win prizes from the ‘Match 3’ bracket, and not from ‘Match 1’ and ‘Match 2’.',
            )}
          </Text>
        </Flex>
        <Flex flex="1" justifyContent="center">
          <MatchExampleCard />
        </Flex>
      </GappedFlex>
      <Divider />
      <Flex flex="2" mb="24px" flexDirection="column" style={{ textAlign: 'center' }}>
        <Heading mb="24px" scale="lg" color="secondary">
          {t('Prize Funds')}
        </Heading>
        <Heading mb="24px" scale="md">{t('The prizes for each lottery round come from three sources:')}</Heading>
      </Flex>
      <GappedFlex flexDirection={['column', 'column', 'column', 'row']}>
        <Flex flex="2" flexDirection="column">

          <Heading my="16px" scale="md">
            {t('Ticket Purchases')}
          </Heading>
          <BulletList>
              <Text display="inline" color="primary">
                {t('100% of the LUCHOW paid by people buying tickets that round goes back into the prize pools.')}
              </Text>
          </BulletList>
          <Heading my="16px" scale="md">
            {t('Rollover Prizes')}
          </Heading>
          <BulletList>
              <Text display="inline" color="primary">
                {t(
                  'Every section or prize brackets with a non-winning candidate will be rolled over into the next lottery draw prize pools',
                )}
              </Text>
          </BulletList>
          <Heading my="16px" scale="md">
            {t('Treasury')}
          </Heading>
          <BulletList>
              <Text display="inline" color="primary">
                {t(
                  'There will be occasional LUCHOW injection into the lottery prize pool',
                )}
              </Text>
          </BulletList>
        </Flex>
        <Flex flex="1" justifyContent="center">
          <PoolAllocations />
        </Flex>
      </GappedFlex>
    </Box>
  )
}

export default HowToPlay2
