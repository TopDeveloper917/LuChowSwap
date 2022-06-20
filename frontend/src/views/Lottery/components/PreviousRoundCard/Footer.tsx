import React, { useEffect, useState } from 'react'
import { Flex, ExpandableLabel, CardFooter } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { LotteryRound } from 'state/types'
import FooterExpanded from './FooterExpanded'

interface PreviousRoundCardFooterProps {
  lotteryNodeData: LotteryRound
  lotteryId: string
}

const PreviousRoundCardFooter: React.FC<PreviousRoundCardFooterProps> = ({ lotteryNodeData, lotteryId }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!lotteryId) {
      setIsExpanded(false)
    }
  }, [lotteryId])

  return (
    <CardFooter p="0" style={{ background: '#f65d1c' }}>
      {isExpanded && <FooterExpanded lotteryNodeData={lotteryNodeData} lotteryId={lotteryId} />}
      <Flex p="8px 24px" alignItems="center" justifyContent="center">
        <div style={{ background: 'linear-gradient(180deg, #f7ef00 0%, #ff8205 100%)', borderRadius: 50, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ExpandableLabel
            expanded={isExpanded}
            onClick={() => {
              if (lotteryId) {
                setIsExpanded(!isExpanded)
              }
            }}
          >
            {isExpanded ? t('Hide') : t('Details')}
          </ExpandableLabel>
        </div>
      </Flex>
    </CardFooter>
  )
}

export default PreviousRoundCardFooter
