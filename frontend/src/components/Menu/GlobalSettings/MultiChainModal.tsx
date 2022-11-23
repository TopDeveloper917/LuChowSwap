import React, { useState } from 'react'
import styled from 'styled-components'
import { Text, Flex, Modal, InjectedModalProps, IconButton, useModal } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'

const ScrollableContainer = styled(Flex)`
  flex-direction: column;
  max-height: 400px;
  ${({ theme }) => theme.mediaQueries.sm} {
    max-height: none;
  }
  & > .activeNetwork {
    border-color: #e24717;
  }
`
const CustomFlex = styled(Flex)`
  border: 1px solid #666171;
  border-radius: 7px;
  padding: 12px;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
  & > img {
    width: 24px;
    height: 24px;
  }
  & > div {
    text-transform: uppercase;
    font-size: 18px;
    color: #e24717;
    padding-left: 14px;
  }
`

export const MultiChainModal: React.FC<InjectedModalProps> = ({ onDismiss }) => {
  const { t } = useTranslation()

  const redirectPath = (path: string) => {
    window.location.href = path;
  }

  return (
    <Modal
      title={t('Select a network')}
      headerBackground="gradients.cardHeader"
      onDismiss={onDismiss}
      style={{ maxWidth: '420px' }}
    >
      <ScrollableContainer>
        <CustomFlex onClick={() => redirectPath('https://eth.luchowswap.com/swap')}>
          <img src='/images/tokens/eth.png' alt='Network' />
          <div>{t('Ethereum')}</div>
        </CustomFlex>
        <CustomFlex  className='activeNetwork'>
          <img src='/images/tokens/bsc.png' alt='Network' />
          <div>{t('BSC')}</div>
        </CustomFlex>
        <CustomFlex onClick={() => redirectPath('https://pol.luchowswap.com/swap')}>
          <img src='/images/tokens/polygon.png' alt='Network' />
          <div>{t('Polygon')}</div>
        </CustomFlex>
      </ScrollableContainer>
    </Modal>
  )
}

type Props = {
  color?: string
  mr?: string
}

export const MultiChainSettings = ({ color, mr = '8px' }: Props) => {
  const [onCurrentChainModal] = useModal(<MultiChainModal />)
  return (
    <Flex>
      <IconButton onClick={onCurrentChainModal} variant="text" scale="sm" mr={mr}>
        <img src='/images/tokens/bsc.png' alt='Network' style={{ width: 24, height: 24 }} />
      </IconButton>
    </Flex>
  )
}