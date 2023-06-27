import { useState } from "react";
import { Button, Box, Link } from "@chakra-ui/react";

const EmailButton: React.FC<{ email: string }> = ({ email }) => {
  const [showEmail, setShowEmail] = useState(false);

  const handleButtonClick = () => {
    setShowEmail(true);
  };

  return (
    <Box mt={5}>
      {!showEmail ? (
        <Button onClick={handleButtonClick}>Wyświetl adres e-mail</Button>
      ) : null}
      {showEmail ? <Link href={`mailto:${email}`}>{email}</Link> : null}
    </Box>
  );
};

export default EmailButton;
