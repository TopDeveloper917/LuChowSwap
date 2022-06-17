import React from 'react'
import { ButtonMenu, ButtonMenuItem, LotteryMenuItem } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'

const HistoryTabMenu = ({ setActiveIndex, activeIndex }) => {
  const { t } = useTranslation()

  return (
    <ButtonMenu activeIndex={activeIndex} onItemClick={setActiveIndex} scale="sm" variant="subtle">
      <LotteryMenuItem activeBackground='linear-gradient(180deg, #f7ef00 0%, #ff8205 100%)'>{t('All History')}</LotteryMenuItem>
      <LotteryMenuItem activeBackground='linear-gradient(180deg, #f7ef00 0%, #ff8205 100%)'>{t('Your History')}</LotteryMenuItem>
    </ButtonMenu>
  )
}

export default HistoryTabMenu
