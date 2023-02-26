import type { FlexProps } from "@chakra-ui/react";
import { Flex, Icon, Link } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import NextLink from "next/link";

interface NavItemProps extends FlexProps {
  icon: IconType;
  children: string;
  href: string;
}

export const NavItem = ({ icon, children, href, ...rest }: NavItemProps) => {
  return (
    <Link
      as={NextLink}
      legacyBehavior
      href={href}
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: "blue.400",
          color: "white",
        }}
        transition="0.1s ease-in-out"
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: "white",
            }}
            transition="0.1s ease-in-out"
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};
