import React from "react";
import styled from "styled-components";
import Button from "../Button/Button";
import { BaseButtonProps, PolymorphicComponent, variants } from "../Button/types";

interface LotteryMenuItemProps extends BaseButtonProps {
  isActive?: boolean;
  activeBackground?: string;
  inActiveBackground?: string;
}
interface InactiveButtonProps extends BaseButtonProps {
  forwardedAs: BaseButtonProps["as"];
  inActiveBackground?: string;
}
interface ActiveButtonProps extends BaseButtonProps {
  forwardedAs: BaseButtonProps["as"];
  activeBackground?: string;
}

const InactiveButton: PolymorphicComponent<InactiveButtonProps, "button"> = styled(Button)<InactiveButtonProps>`
  background: ${({ inActiveBackground }) => (inActiveBackground ? inActiveBackground : '')};
  color: ${({ theme, variant }) => (variant ? ( variant === variants.PRIMARY ? theme.colors.primary : variant) : theme.colors.textSubtle)};
  &:hover:not(:disabled):not(:active) {
    background-color: transparent;
  };
  font-size: 15px;
  height: 35px;
`;
const ActiveButton: PolymorphicComponent<ActiveButtonProps, "button"> = styled(Button)<ActiveButtonProps>`
  font-size: 15px;
  height: 35px;
  color: ${({ theme, variant }) => (variant ? ( variant === variants.PRIMARY ? theme.colors.primary : variant) : theme.colors.textSubtle)};
  background: ${({ activeBackground }) => (activeBackground ? activeBackground : '')};
`;

const LotteryMenuItem: PolymorphicComponent<LotteryMenuItemProps, "button"> = ({
  isActive = false,
  activeBackground = '',
  inActiveBackground = '',
  variant = variants.PRIMARY,
  as,
  ...props
}: LotteryMenuItemProps) => {
  if (!isActive) {
    return <InactiveButton forwardedAs={as} variant={variants.TEXT} inActiveBackground={inActiveBackground} {...props} />;
  }

  return <ActiveButton forwardedAs={as} variant={variants.PRIMARY} activeBackground={activeBackground} {...props} />;
};

export default LotteryMenuItem;
