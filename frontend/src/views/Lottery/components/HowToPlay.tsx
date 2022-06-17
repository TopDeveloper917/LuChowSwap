import React from 'react'
import styled from 'styled-components'
import { Box, Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'

const StepContainer = styled(Flex)`
  gap: 24px;
  width: 100%;
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`
const StyledStepCard = styled(Box)`
  display: flex;
  align-self: baseline;
  position: relative;
  background: #f65d1c;
  padding: 1px 1px 3px 1px;
  border-radius: ${({ theme }) => theme.radii.card};
`
const StepCardInner = styled(Box)`
  width: 100%;
  padding: 24px;
  background: #f65d1c;
  border-radius: ${({ theme }) => theme.radii.card};
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const StepCardHeader = styled(Text)`
  position: absolute;
  top: 0%; right: 50%;
  transform: translate(50%,-50%);
  padding: 15px 40px;
  border-radius: 50px;
  background: linear-gradient(180deg, #f7ef00 0%, #ff8205 100%);
  color: #a83514;
`

type Step = { title: string; subtitle: string; label: string }

const StepCard: React.FC<{ step: Step }> = ({ step }) => {
  return (
    <StyledStepCard width="100%">
      <StepCardInner height={['200px', '180px', null, '200px']}>
        <StepCardHeader mb="16px" fontSize="12px" bold textAlign="right" textTransform="uppercase">
          {step.label}
        </StepCardHeader>
        <Heading mb="16px" scale="lg" color="secondary">
          {step.title}
        </Heading>
        <Text color="text">{step.subtitle}</Text>
      </StepCardInner>
    </StyledStepCard>
  )
}

const HowToPlay: React.FC = () => {
  const { t } = useTranslation()

  const steps: Step[] = [
    {
      label: t('Step %number%', { number: 1 }),
      title: t('Buy Tickets'),
      subtitle: t('Prices are set when the round starts, equal to 5 USD in LUCHOW per ticket.'),
    },
    {
      label: t('Step %number%', { number: 2 }),
      title: t('Wait for the Draw'),
      subtitle: t('There are two draws every day: one every 12 hours.'),
    },
    {
      label: t('Step %number%', { number: 3 }),
      title: t('Check for Prizes'),
      subtitle: t('Once the round’s over, come back to the page and check to see if you’ve won!'),
    },
  ]
  return (
    <Box width="100%">
      <Flex mb="40px" alignItems="center" flexDirection="column">
        <Heading mb="24px" scale="xl" color="secondary">
          {t('How to Play')}
        </Heading>
        <Heading textAlign="center">
          {t(
            'If the digits on your tickets match the winning numbers in the correct order, you win a portion of the prize pool.',
          )}
        </Heading>
        <Heading>{t('Simple!')}</Heading>
      </Flex>
      <StepContainer>
        {steps.map((step) => (
          <StepCard key={step.label} step={step} />
        ))}
      </StepContainer>
    </Box>
  )
}

export default HowToPlay
