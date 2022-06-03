import { FooterLinkType } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'

export const footerLinks: (t: ContextApi['t']) => FooterLinkType[] = (t) => [
  {
    label: t('About'),
    isHighlighted: true,
    items: [
      {
        label: t('Contact'),
        href: 'https://git-doc-1.gitbook.io/contact-us',
      },
      {
        label: t('Brand'),
        href: 'https://git-doc-1.gitbook.io/contact-us/brand-and-logos',
      },
      // {
      //   label: t('Blog'),
      //   href: 'https://medium.com/pancakeswap',
      // },
      {
        label: t('Community'),
        href: 'https://git-doc-1.gitbook.io/contact-us/social-accounts-and-communities',
      },
      {
        label: t('LUCHOW token'),
        href: 'https://git-doc-1.gitbook.io/contact-us/tokenomics/luchow',
      },
      // {
      //   label: '—',
      // },
      // {
      //   label: t('Online Store'),
      //   href: 'https://pancakeswap.creator-spring.com/',
      //   isHighlighted: true,
      // },
    ],
  },
  {
    label: t('Help'),
    items: [
      {
        label: t('Customer Support'),
        href: 'https://git-doc-1.gitbook.io/contact-us/contact-us/customer-support',
      },
      {
        label: t('Troubleshooting'),
        href: 'https://git-doc-1.gitbook.io/contact-us/contact-us/customer-support/troubleshooting-errors',
      },
      // {
      //   label: t('Guides'),
      //   href: 'https://docs.pancakeswap.finance/get-started',
      // },
    ],
  },
  {
    label: t('Developers'),
    items: [
      {
        label: 'Github',
        href: 'https://github.com/LuchowSwap',
      },
      {
        label: t('Documentation'),
        href: 'https://git-doc-1.gitbook.io',
      },
      // {
      //   label: t('Bug Bounty'),
      //   href: 'https://app.gitbook.com/@pancakeswap-1/s/pancakeswap/code/bug-bounty',
      // },
      // {
      //   label: t('Audits'),
      //   href: 'https://docs.pancakeswap.finance/help/faq#is-pancakeswap-safe-has-pancakeswap-been-audited',
      // },
      // {
      //   label: t('Careers'),
      //   href: 'https://docs.pancakeswap.finance/hiring/become-a-chef',
      // },
    ],
  },
]
