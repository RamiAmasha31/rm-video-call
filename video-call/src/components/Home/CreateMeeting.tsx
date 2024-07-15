import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useVideoClient } from "../VideoClientContext";
import {
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  CallControls,
  CancelCallButton,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const MyUILayout = React.memo(({ client, call }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  const handleLeaveCall = useCallback(() => {
    if (call) {
      call.endCall();

      navigate("/home");
    }
  }, [call, navigate]);

  if (callingState !== CallingState.JOINED) {
    return <div>Loading...</div>;
  }

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="top" />
      <CallControls onLeave={handleLeaveCall} />
    </StreamTheme>
  );
});

const CreateMeeting = () => {
  const { client } = useVideoClient();
  const [call, setCall] = React.useState(null);

  // Function to create and join the meeting
  const handleCreateMeeting = useCallback(async () => {
    if (!client) {
      console.error("StreamVideoClient is not initialized.");
      return;
    }

    const callType = "default";
    const callId = "test-call"; // Replace with dynamic call ID logic if needed
    if (!call) {
      try {
        const newCall = client.call(callType, callId);
        await newCall.getOrCreate();
        await newCall.join();
        console.log("Call created and joined successfully:", newCall);
        setCall(newCall); // Update the call state
      } catch (error) {
        console.error("Error creating or joining call:", error);
        // Handle error (show message, retry, etc.)
      }
    }
  }, [client]);

  // useEffect to handle meeting creation on component mount
  useEffect(() => {
    handleCreateMeeting(); // Call the function to create and join the meeting
  }, [handleCreateMeeting]);

  return (
    <div className="create-meeting-page">
      <nav className="navbar">
        <div className="navbar-brand">Create Meeting</div>
      </nav>
      <div className="main-content">
        {call ? (
          <StreamCall call={call}>
            <MyUILayout client={client} call={call} />
          </StreamCall>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default CreateMeeting;
