import React from "react";
import { Box } from "../Box";
import MenuItem from "../MenuItem/MenuItem";
import IconComponent from "../Svg/IconComponent";
import StyledSubMenuItems from "./styles";
import { SubMenuItemsProps } from "./types";
import styled from "styled-components";
const KroimSubMenuContainer = styled.div<{ $isMobileOnly: boolean }>`
  ${({ theme }) => theme.mediaQueries.sm} {
    ${({ $isMobileOnly }) => ($isMobileOnly ? "display:none" : "")};
  }
  position: absolute;
  display: flex;
  top: -20px;
`;
const KroimSubMenuBox = styled(Box)<{isActive: boolean}>`
  padding: 0 32px 0 12px;
  background: ${({ isActive }) => (isActive ? 'linear-gradient(to top,#e24717 0%,#781f02 100%)' : 'linear-gradient(to bottom,#9b2b09 0%,#491200 100%)')};
  border-top-left-radius: 24px;
  border-bottom-right-radius: 24px;
  margin: 0 -12px;
  &:last-child{
    padding: 0 12px;
  }
`
const SubMenuItems: React.FC<SubMenuItemsProps> = ({ items = [], activeItem, isMobileOnly = false, ...props }) => {
  return (
    <StyledSubMenuItems
      justifyContent={[isMobileOnly ? "flex-end" : "start", null, "center"]}
      {...props}
      pl={["12px", null, "0px"]}
      $isMobileOnly={isMobileOnly}
    >
      <KroimSubMenuContainer $isMobileOnly={isMobileOnly}>
        {items.map(
          ({ label, href, iconName }) =>
            label && (
              <KroimSubMenuBox key={label} isActive={href === activeItem}>
                <MenuItem href={href} isActive={href === activeItem} variant="subMenu">
                  {iconName && (
                    <IconComponent
                      color={href === activeItem ? "secondary" : "textSubtle"}
                      iconName={iconName}
                      mr="4px"
                    />
                  )}
                  {label}
                </MenuItem>
              </KroimSubMenuBox>
            )
        )}
      </KroimSubMenuContainer>

    </StyledSubMenuItems>
  );
};

export default SubMenuItems;
