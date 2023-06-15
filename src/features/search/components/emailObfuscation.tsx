import { useState } from "react";
import { Button, Box } from "@chakra-ui/react";

interface Organization {
  owner: {
    email: string;
  };
}

interface EmailButtonProps {
  data: Organization;
}

const EmailButton: React.FC<EmailButtonProps> = ({ data }) => {
  const [showEmail, setShowEmail] = useState(false);

  const handleButtonClick = () => {
    setShowEmail(true);
  };

  const handleEmailClick = () => {
    const emailUrl = `mailto:${data.owner.email}`;
    window.open(emailUrl);
  };

  return (
    <Box>
      {!showEmail && (
        <Button onClick={handleButtonClick}>Wyświetl adres e-mail</Button>
      )}
      {showEmail && (
        <Button onClick={handleEmailClick}>{data.owner.email}</Button>
      )}
    </Box>
  );
};

export default EmailButton;
