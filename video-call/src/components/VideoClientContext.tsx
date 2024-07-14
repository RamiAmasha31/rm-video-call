// VideoClientContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { StreamVideoClient, User } from "@stream-io/video-react-sdk";

interface VideoClientContextType {
  client: StreamVideoClient | null;
}

const VideoClientContext = createContext<VideoClientContextType>({
  client: null,
});

export const useVideoClient = () => useContext(VideoClientContext);

export const VideoClientProvider: React.FC = ({ children }) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    // Obtain apiKey and token after user login
    const apiKey = "rgkeykz9gwms";
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoicmFtaSJ9.O2ngyKVlTtI4Pspp8f2OtY9vxNK0BOVPWJwiV5qujcI"; // Replace with actual token

    // Example user object (replace with your actual user data)
    const user: User = {
      id: "rami",
    };

    // Initialize StreamVideoClient
    const videoClient = new StreamVideoClient({ apiKey, token, user });
    setClient(videoClient);

    return () => {
      // Clean up if necessary (disconnect user, etc.)
      videoClient.disconnectUser();
    };
  }, []);

  return (
    <VideoClientContext.Provider value={{ client }}>
      {children}
    </VideoClientContext.Provider>
  );
};
