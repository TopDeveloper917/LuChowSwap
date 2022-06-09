import React from 'react'
import { Heading, Flex, Text, useMatchBreakpoints } from '@pancakeswap/uikit'

const StatCardContent: React.FC<{ headingText: string; bodyText: string; highlightColor: string }> = ({
  headingText,
  bodyText,
  highlightColor,
}) => {
  const { isMobile, isTablet } = useMatchBreakpoints()
  const isSmallerScreen = isMobile || isTablet
  const split = headingText.split(' ')
  const lastWord = split.pop()
  const remainingWords = split.slice(0, split.length).join(' ')

  return (
    <Flex
      minHeight={[null, null, null, '168px']}
      minWidth="232px"
      width="fit-content"
      flexDirection="column"
      justifyContent="flex-end"
      mt={[null, null, null, null]}
    >
      <Heading scale="lg" color='primary'>Coming soon...</Heading>
      {/* {isSmallerScreen && remainingWords.length > 13 ? (
        <Heading scale="lg" color='primary'>{remainingWords}</Heading>
      ) : (
        <Heading scale="xl" color='primary'>{remainingWords}</Heading>
      )} */}
      <Heading color='text' scale="xl" mb="24px">
        {lastWord}
      </Heading>
      <Text color="textSubtle">{bodyText}</Text>
    </Flex>
  )
}

export default StatCardContent
