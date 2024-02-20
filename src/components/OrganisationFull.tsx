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
  LinkBox,
  LinkOverlay,
  Button,
} from "@chakra-ui/react";
import React from "react";
import { Tag } from "./Tag";
import Image from "next/image";
import ImageGallery from "react-image-gallery";
import {
  FaLink,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";

import { useState } from "react";
import { directusFileUrl } from "@/utils/directus";
import "react-image-gallery/styles/css/image-gallery.css";
import { z } from "zod";

const EmailButton = ({ email }: { email: string }) => {
  const [showEmail, setShowEmail] = useState(false);

  const handleButtonClick = () => {
    setShowEmail(true);
  };

  return (
    <Box mt={5}>
      {showEmail ? (
        <Link href={`mailto:${email}`}>{email}</Link>
      ) : (
        <Button onClick={handleButtonClick}>Wyświetl adres e-mail</Button>
      )}
    </Box>
  );
};

const recoverUrl = (url?: string) => {
  if (!url) {
    return undefined;
  }

  const isValidUrl = (url: string) => {
    const parse = z.string().url().safeParse(url);

    return parse.success;
  };

  if (isValidUrl(url)) {
    return url;
  }

  const newUrl = url.startsWith("http") ? url : `https://${url}`;

  if (isValidUrl(newUrl)) {
    return newUrl;
  }

  return undefined;
};

const getIconForContactType = (contactType: string) => {
  switch (true) {
    case contactType.includes("facebook"):
      return <FaFacebook />;
    case contactType.includes("twitter"):
      return <FaTwitter />;
    case contactType.includes("instagram"):
      return <FaInstagram />;
    case contactType.includes("youtube"):
      return <FaYoutube />;
    case contactType.includes("linkedin"):
      return <FaLinkedin />;
    default:
      return <FaLink />;
  }
};

const Show = <T,>({
  children,
  when,
}: {
  children?: React.ReactNode;
  when?: T;
}) => {
  if (!when) {
    return null;
  }

  return <>{children}</>;
};

export const OrganisationFull = ({
  data,
}: {
  data: RouterOutputs["organizations"]["get"];
}) => {
  const galleryRef = React.useRef<ImageGallery>(null);

  return (
    <Container maxW="container.md" mt={16} pb={16} whiteSpace="pre-wrap">
      <Box>
        <Flex align="center" justifyContent="space-between">
          <Heading as="h1" fontSize={["large", "xx-large"]} mt={4}>
            {data.name}
            {data.field ? (
              <Wrap mt={2}>
                <WrapItem>
                  <Tag tag={data.field} />
                </WrapItem>
              </Wrap>
            ) : null}
          </Heading>
          {data.logo ? (
            <Image
              src={directusFileUrl(data.logo)}
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
        {data.tags.map((tag) => (
          <WrapItem key={tag}>
            <Tag tag={tag} />
          </WrapItem>
        ))}
      </Wrap>
      <HStack spacing={4} mt={5} mb={5}>
        <Wrap>
          {[
            recoverUrl(data.website),
            data.facebook,
            data.instagram,
            data.linkedin,
            data.youtube,
          ]
            .filter((x): x is string => Boolean(x))
            .map((contactMethod) => (
              <LinkBox p="2" borderWidth="1px" rounded="md" key={contactMethod}>
                <LinkOverlay href={contactMethod} target="_blank">
                  <Wrap mt={1} padding={1}>
                    {getIconForContactType(contactMethod)}
                  </Wrap>
                </LinkOverlay>
              </LinkBox>
            ))}
        </Wrap>
      </HStack>
      <style>
        {`.image-gallery-content:not(.fullscreen) .image-gallery-slide:not(.fullscreen) .image-gallery-image:not(.fullscreen) {
    max-height: 400px;
}`}
      </style>
      <ImageGallery
        ref={galleryRef}
        stopPropagation={true}
        showPlayButton={false}
        onClick={() => {
          galleryRef.current?.fullScreen();
        }}
        items={data.images.map((id) => ({
          thumbnail: directusFileUrl(id) + "?key=thumb",
          original: directusFileUrl(id) + "?key=gallery",
          fullscreen: directusFileUrl(id) + "?key=full",
          originalHeight: 600,
          originalWidth: 1000,
        }))}
      />
      <Show when={data.longDescription}>
        <Heading as="h2" size="md" mt={5} mb={2}>
          📰 Kim jesteśmy, co robimy 📰
        </Heading>
        <Text textAlign="justify">{data.longDescription}</Text>
      </Show>
      <Show when={data.skillsAndChallenges}>
        <Heading as="h2" size="md" mt={4} mb={2}>
          🔥 Zdobywane umiejętności i wyzwania członków zespołu! 🔥
        </Heading>
        <Text textAlign="justify">{data.skillsAndChallenges}</Text>
      </Show>
      <Show when={data.distinguishingFeatures}>
        <Heading as="h2" size="md" mt={4} mb={2}>
          ✨ Wyróżniamy się tym, że... ✨
        </Heading>
        <Text>{data.distinguishingFeatures}</Text>
      </Show>
      <Show when={data.achievements}>
        <Heading as="h2" size="md" mt={4} mb={2}>
          🏆 Największe sukcesy uczelnianej organizacji studenckiej! 🏆
        </Heading>
        <Text textAlign="justify">{data.achievements}</Text>
      </Show>
      <Show when={data.areasOfInterest}>
        <Heading as="h2" size="md" mt={4} mb={2}>
          🌟 Czym się interesujemy? 🌟
        </Heading>
        <Text textAlign="justify">{data.areasOfInterest}</Text>
      </Show>
      <Show when={data.images && data.images?.length > 0}>
        <Heading as="h2" size="md" mt={4} mb={2}>
          🌄 Galeria 🌄
        </Heading>
      </Show>
      {data.email ? <EmailButton email={data.email} /> : null}
    </Container>
  );
};
