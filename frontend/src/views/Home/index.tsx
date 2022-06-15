import React from 'react'
import styled from 'styled-components'
import PageSection from 'components/PageSection'
import { useWeb3React } from '@web3-react/core'
import { Flex, Svg, Image, Button, Text } from '@pancakeswap/uikit';
import useTheme from 'hooks/useTheme'
import Container from 'components/Layout/Container'
import { PageMeta } from 'components/Layout/Page'
import Hero from './components/Hero'
import { swapSectionData, earnSectionData, cakeSectionData } from './components/SalesSection/data'
import MetricsSection from './components/MetricsSection'
import SalesSection from './components/SalesSection'
import WinSection from './components/WinSection'
import FarmsPoolsRow from './components/FarmsPoolsRow'
import Footer from './components/Footer'
import CakeDataRow from './components/CakeDataRow'

const StyledHeroSection = styled(PageSection)`
  padding-top: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding-top: 48px;
  }
`
const IFOBanner = styled(Container)`
  z-index: 1;
  width: 100%;
  padding: 2% 4%;
  background: linear-gradient(to top,#774E2E 20%,#A03314 100%);
  border-radius: 20px;
  margin-bottom: 5%;
`
const BubbleWrapper = styled(Flex)`
  svg {
    fill: ${({ theme }) => theme.colors.text};
    transition: background-color 0.2s, opacity 0.2s;
  }
  &:hover {
    svg {
      opacity: 0.65;
    }
  }
  &:active {
    svg {
      opacity: 0.85;
    }
  }
`
const CustomHomeDiv = styled.div`
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
const Home: React.FC = () => {
  const { theme } = useTheme()
  const { account } = useWeb3React()

  const HomeSectionContainerStyles = { margin: '0', width: '100%', maxWidth: '968px' }

  return (
    <CustomHomeDiv>
      <PageMeta />
      <StyledHeroSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        background='url(/assets/svgs/PageSVG.svg)'
        index={2}
        hasCurvedDivider={false}
        style={{
          backgroundSize: 'cover',
          backgroundColor: 'rgb(8, 6, 11)',
          paddingBottom: '10%'
        }}
      >
        <IFOBanner>
          <div style={{ color: 'orange' }}>SOON</div>
          <Text color='text' style={{ fontSize: '32px' }}>ERA IFO</Text>
          <BubbleWrapper>
            <Button
              id="clickExchangeHelp"
              as="a"
              external
              href="/"
              variant="primary"
            >
              Go to IFO &nbsp;
              <Svg viewBox="0 0 24 24" color="#FFFFFF" width="20px" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13H16.17L11.29 17.88C10.9 18.27 10.9 18.91 11.29 19.3C11.68 19.69 12.31 19.69 12.7 19.3L19.29 12.71C19.68 12.32 19.68 11.69 19.29 11.3L12.71 4.7C12.32 4.31 11.69 4.31 11.3 4.7C10.91 5.09 10.91 5.72 11.3 6.11L16.17 11H5C4.45 11 4 11.45 4 12C4 12.55 4.45 13 5 13Z" />
              </Svg>
            </Button>
          </BubbleWrapper>
        </IFOBanner>
        <Hero />
      </StyledHeroSection>
      <PageSection
        className='diag-boundary'
        innerProps={{ style: { margin: '0', width: '100%' } }}
        background='linear-gradient(180deg,#0c0300 0%,#14090b 100%)'
        index={2}
        hasCurvedDivider={false}>
        <MetricsSection />
      </PageSection>
      <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        background='url(/assets/svgs/PageSVG.svg)'
        style={{
          paddingBottom: 200,
          backgroundSize: 'cover',
          backgroundColor: '#08060B'
        }}
        index={2}
        hasCurvedDivider={false}
      >
        <SalesSection {...swapSectionData} />
      </PageSection>
      <PageSection
        className='diag-boundary'
        innerProps={{ style: HomeSectionContainerStyles }}
        background='linear-gradient(180deg,#0c0300 0%,#14090b 100%)'
        index={2}
        hasCurvedDivider={false}
        style={{ paddingTop: 0 }}
      >
        <SalesSection {...earnSectionData} />
        <FarmsPoolsRow />
      </PageSection>
      <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        background='url(/assets/svgs/PageSVG.svg)'
        style={{
          paddingBottom: 200,
          backgroundSize: 'cover',
          backgroundColor: '#08060B'
        }}
        index={2}
        hasCurvedDivider={false}
      >
        <WinSection />
      </PageSection>
      <PageSection
        className='diag-boundary'
        innerProps={{ style: HomeSectionContainerStyles }}
        background='linear-gradient(180deg,#0c0300 0%,#14090b 100%)'
        index={2}
        hasCurvedDivider={false}
      >
        <SalesSection {...cakeSectionData} />
        <CakeDataRow />
      </PageSection>
      <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        background="linear-gradient(180deg, #621903, #38100500)"
        index={2}
        hasCurvedDivider={false}
      >
        <Footer />
      </PageSection>
    </CustomHomeDiv>
  )
}

export default Home
