import type { RouterOutputs } from "@/utils/api";
import {
  Container,
  Link,
  Heading,
  Text,
  Wrap,
  WrapItem,
  HStack,
  Box,
  Flex,
  SimpleGrid,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { Tag } from "./Tag";
import Image from "next/image";
import {
  FaLink,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { EmailButton } from "./EmailObfuscation";

const getIconForContactType = (contactType: string) => {
  switch (contactType) {
    case "website":
      return <FaLink />;
    case "facebook":
      return <FaFacebook />;
    case "twitter":
      return <FaTwitter />;
    case "instagram":
      return <FaInstagram />;
    case "youtube":
      return <FaYoutube />;
    default:
      return <FaLink />;
  }
};

const getContactFixedName = (contactType: string) => {
  switch (contactType) {
    case "website":
      return "Strona Internetowa";
    case "facebook":
      return "Facebook";
    case "twitter":
      return "Twitter";
    case "instagram":
      return "Instagram";
    case "youtube":
      return "Youtube";
    default:
      return contactType;
  }
};

export const OrganisationFull = ({
  data,
  forAdminPage,
}: {
  data: RouterOutputs["organizations"]["get"];
  forAdminPage?: boolean;
}) => {
  if (!data) {
    return null;
  }

  return (
    <Container maxW="container.md" mt={16} pb={16}>
      {!forAdminPage ? (
        <Link href="/" color="gray" as={NextLink}>
          Wróć
        </Link>
      ) : null}
      <Box>
        <Flex align="center" justifyContent="space-between">
          <Heading as="h1" mt={4}>
            {data.name}

            <Wrap mt={2}>
              <WrapItem key={data.type}>
                <Tag tag={data.type} />
              </WrapItem>

              <WrapItem key={data.fieldOfStudy}>
                <Tag tag={data.fieldOfStudy} />
              </WrapItem>
            </Wrap>
          </Heading>
          {data.logoUrl ? (
            <Image
              src={data.logoUrl}
              width={100}
              height={100}
              style={{
                margin: "0.6rem",
                height: "6.25rem",
                width: "6.25rem",
                objectFit: "contain",
              }}
              priority={true}
              alt={`Logo ${data.name}`}
            />
          ) : null}
        </Flex>
      </Box>

      <Wrap mt={2}>
        {data.Tags.map((tag) => (
          <WrapItem key={tag.text}>
            <Tag tag={tag.text} />
          </WrapItem>
        ))}
      </Wrap>
      <HStack spacing={4} mt={5}>
        <Wrap>
          {data.ContactMethods.map((contactMethod) => (
            <LinkBox
              p="2"
              borderWidth="1px"
              rounded="md"
              key={contactMethod.id}
            >
              <LinkOverlay href={contactMethod.contactLink} target="_blank">
                <Wrap mt={1} padding={1}>
                  {getIconForContactType(contactMethod.contactType)}
                  {getContactFixedName(contactMethod.contactType)}
                </Wrap>
              </LinkOverlay>
            </LinkBox>
          ))}
        </Wrap>
      </HStack>

      <Heading as="h2" size="md" mt={5} mb={2}>
        📰 Kim jesteśmy, co robimy 📰
      </Heading>
      <Text>{data.longDescription}</Text>
      {data.ContactMethods.length > 0 ? (
        <>
          <Heading as="h2" size="md" mt={4} mb={2}>
            🔥 Zdobywane umiejętności i wyzwania członków zespołu! 🔥
          </Heading>
          <Text>{data.skillsAndChallenges}</Text>
          <Heading as="h2" size="md" mt={4} mb={2}>
            ✨ Wyróżniamy się tym, że... ✨
          </Heading>
          <Text>{data.distinguishingFeatures}</Text>
          <Heading as="h2" size="md" mt={4} mb={2}>
            🏆 Największe sukcesy uczelnianej organizacji studenckiej! 🏆
          </Heading>
          <Text>{data.achievements}</Text>
          <Heading as="h2" size="md" mt={4} mb={2}>
            🌟 Obszary zainteresowań studentów dołączających do naszej
            organizacji! 🌟
          </Heading>
          <Text>{data.areasOfInterest}</Text>

          <Heading as="h2" size="md" mt={4} mb={2}>
            🌄 Galeria 🌄
          </Heading>
          <SimpleGrid minChildWidth={200} columns={3} spacing={4}>
            {data.photos.map((photo) => (
              <Image
                key={photo}
                src={photo}
                alt={"Zdjęcie z galerii organizacji"}
                width={300}
                height={300}
              />
            ))}
          </SimpleGrid>

          <EmailButton email={data.owner.email} />
        </>
      ) : null}
    </Container>
  );
};
