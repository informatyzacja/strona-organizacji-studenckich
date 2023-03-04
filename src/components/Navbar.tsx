import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Link,
  useColorModeValue,
  useDisclosure,
  Avatar,
  Center,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Divider,
  VStack,
  HStack,
  ScaleFade,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import NextImage from "next/image";
import logoPwr from "../../public/logo-pwr.svg";
import NextLink from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Loading } from "./Loading";

const PwrLogo = () => {
  return (
    <NextLink href="/">
      <NextImage src={logoPwr as string} alt="logo Pwr" />
    </NextLink>
  );
};
export const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { status, data } = useSession();
  const router = useRouter();

  return (
    <Box bg={useColorModeValue("white", "gray.800")}>
      <Flex
        mx="auto"
        color={useColorModeValue("gray.600", "white")}
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 4, md: 24 }}
        align={"center"}
      >
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <PwrLogo />
          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>
        {status === "loading" ? <Loading /> : null}
        {status === "unauthenticated" ? (
          <ScaleFade in={true}>
            <Stack
              flex={{ base: 1, md: 0 }}
              justify={"flex-end"}
              direction={"row"}
              spacing={6}
            >
              <Button
                fontSize={"sm"}
                fontWeight={400}
                variant={"link"}
                onClick={() => {
                  void signIn("google");
                }}
              >
                Zaloguj się
              </Button>
            </Stack>
          </ScaleFade>
        ) : null}
        {status === "authenticated" ? (
          <ScaleFade in={true}>
            <Box ml={4} display={{ base: "none", md: "flex" }}>
              {data.user.role === "ADMIN" ? (
                <Button
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => {
                    void router.push("/admin");
                  }}
                >
                  Panel Administratora
                </Button>
              ) : null}
              {data.user.role === "OWNER" ? (
                <Button
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => {
                    void router.push("/manager");
                  }}
                >
                  Zarządzanie organizacją
                </Button>
              ) : null}
              <Box w={4} />
              <Menu direction="rtl" placement="bottom" autoSelect={false}>
                <MenuButton
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                  minW={0}
                  border={"2px solid transparent"}
                  _hover={{
                    border: "2px solid black",
                  }}
                  aria-label="Menu użytkownika"
                >
                  <Avatar
                    size={"sm"}
                    name={data.user?.name ?? ""}
                    src={data.user.image ?? ""}
                    referrerPolicy="no-referrer"
                  />
                </MenuButton>
                <MenuList alignItems={"center"} p={3}>
                  <Center>
                    <Avatar
                      size={"2xl"}
                      name={data.user?.name ?? ""}
                      src={data.user.image ?? ""}
                      referrerPolicy="no-referrer"
                    />
                  </Center>
                  <Center mt={4}>
                    <p>{data.user?.email}</p>
                  </Center>
                  <MenuDivider />
                  <MenuItem
                    onClick={() => {
                      void signOut({ redirect: false }).then(() => {
                        void router.push("/");
                      });
                    }}
                  >
                    Wyloguj się
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </ScaleFade>
        ) : null}
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
};

const DesktopNav = () => {
  const linkColor = useColorModeValue("gray.600", "gray.200");
  const linkHoverColor = useColorModeValue("gray.800", "white");

  return (
    <Stack direction={"row"} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Link
            p={2}
            href={navItem.href ?? "#"}
            fontSize={"sm"}
            fontWeight={500}
            color={linkColor}
            _hover={{
              textDecoration: "none",
              color: linkHoverColor,
            }}
          >
            {navItem.label}
          </Link>
        </Box>
      ))}
    </Stack>
  );
};

const MobileNav = () => {
  const { data, status } = useSession();

  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      p={4}
      display={{ md: "none" }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
      <Divider />
      {status === "authenticated" ? (
        <VStack>
          <HStack>
            <Avatar
              size="sm"
              name={data?.user?.name ?? ""}
              src={data.user.image ?? ""}
            />
            <p>{data?.user?.name}</p>
          </HStack>
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={() => {
              void signOut();
            }}
          >
            Wyloguj się
          </Button>
        </VStack>
      ) : null}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        href={href ?? "#"}
        justify={"space-between"}
        align={"center"}
        _hover={{
          textDecoration: "none",
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue("gray.600", "gray.200")}
        >
          {label}
        </Text>
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("gray.200", "gray.700")}
          align={"start"}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} href={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [];
