import React, { createContext, useContext, useState, useEffect } from "react";
import { StreamVideoClient, User } from "@stream-io/video-react-sdk";

interface VideoClientContextType {
  client: StreamVideoClient | null;
  user: User | null;
  setClientDetails: (userId: string, token: string) => void;
}

const VideoClientContext = createContext<VideoClientContextType>({
  client: null,
  user: null,
  setClientDetails: () => {},
});

export const useVideoClient = () => useContext(VideoClientContext);

export const VideoClientProvider: React.FC = ({ children }) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedClientDetails = localStorage.getItem("streamClientDetails");
    if (storedClientDetails) {
      const { userId, token } = JSON.parse(storedClientDetails);
      const apiKey = "rgkeykz9gwms";
      const user = { id: userId };
      const videoClient = new StreamVideoClient({ apiKey, token, user });
      setClient(videoClient);
      setUser(user);
    }
  }, []);

  const setClientDetails = (userId: string, token: string) => {
    localStorage.setItem(
      "streamClientDetails",
      JSON.stringify({ userId, token })
    );
    const apiKey = "rgkeykz9gwms";
    const user = { id: userId };
    const videoClient = new StreamVideoClient({ apiKey, token, user });
    setClient(videoClient);
    setUser(user);
  };

  useEffect(() => {
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [client]);

  return (
    <VideoClientContext.Provider value={{ client, user, setClientDetails }}>
      {children}
    </VideoClientContext.Provider>
  );
};
