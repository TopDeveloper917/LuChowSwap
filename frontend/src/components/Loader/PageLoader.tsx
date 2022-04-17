import React from 'react'
import styled from 'styled-components'
//  import { Spinner } from '@pancakeswap/uikit'

import Page from '../Layout/Page'
import CircleLoader from './CircleLoader'

const Wrapper = styled(Page)`
  display: flex;
  justify-content: center;
  align-items: center;
`

const PageLoader: React.FC = () => {
  return (
    <Wrapper>
      <CircleLoader size='72px'/>
    </Wrapper>
  )
}

export default PageLoader
