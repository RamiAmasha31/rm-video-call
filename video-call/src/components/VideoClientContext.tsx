import React, { createContext, useContext, useState, useEffect } from "react";
import { StreamVideoClient, User } from "@stream-io/video-react-sdk";

interface VideoClientContextType {
  client: StreamVideoClient | null;
  setClientDetails: (userId: string, token: string) => void;
}

const VideoClientContext = createContext<VideoClientContextType>({
  client: null,
  setClientDetails: () => {},
});

export const useVideoClient = () => useContext(VideoClientContext);

export const VideoClientProvider: React.FC = ({ children }) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    // Check if client details are stored in localStorage
    const storedClientDetails = localStorage.getItem("streamClientDetails");
    if (storedClientDetails) {
      const { userId, token } = JSON.parse(storedClientDetails);
      const apiKey = "rgkeykz9gwms";
      const user: User = {
        id: userId,
      };
      const videoClient = new StreamVideoClient({ apiKey, token, user });
      setClient(videoClient);
    }
  }, []);

  const setClientDetails = (userId: string, token: string) => {
    // Store client details in localStorage for persistence across refreshes
    localStorage.setItem(
      "streamClientDetails",
      JSON.stringify({ userId, token })
    );

    // Initialize StreamVideoClient
    const apiKey = "rgkeykz9gwms";
    const user: User = {
      id: userId,
    };
    const videoClient = new StreamVideoClient({ apiKey, token, user });
    setClient(videoClient);
  };

  useEffect(() => {
    // Optional: Handle cleanup if necessary (e.g., disconnect user)
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [client]);

  return (
    <VideoClientContext.Provider value={{ client, setClientDetails }}>
      {children}
    </VideoClientContext.Provider>
  );
};
