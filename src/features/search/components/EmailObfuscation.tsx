import { useState } from "react";
import { Button, Box, Link } from "@chakra-ui/react";

export const EmailButton = ({ email }: { email: string }) => {
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
