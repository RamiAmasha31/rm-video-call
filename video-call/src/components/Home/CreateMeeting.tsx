import React, { useEffect, useCallback, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useVideoClient } from "../VideoClientContext";
import {
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  CallControls,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const generateCallId = () => {
  return `call-${Math.random().toString(36).substr(2, 9)}`;
};

const MyUILayout = React.memo(
  ({ client, call, callId, dialogOpen, onCloseDialog }) => {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();
    const navigate = useNavigate();

    const fetchParticipants = async (callId) => {
      try {
        const response = await fetch(
          `http://localhost:3002/api/meeting/${callId}/participants`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text(); // Get the error message from the server
          throw new Error(`Failed to fetch participants: ${errorText}`);
        }

        const participants = await response.json(); // Parse the response as JSON
        console.log("Participants:", participants);
        // You might want to do something with the participants here
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    const handleLeaveCall = useCallback(async () => {
      if (call) {
        try {
          console.log("Leaving call with ID:", callId);
          // Fetch participants before ending the call
          await fetchParticipants(callId);

          // End the call
          await call.endCall();
          navigate("/home");
        } catch (error) {
          console.error("Error during leaving the call:", error);
        }
      }
    }, [call, callId, navigate]);

    if (callingState !== CallingState.JOINED) {
      return <div>Loading...</div>;
    }

    return (
      <StreamTheme>
        <SpeakerLayout participantsBarPosition="top" />
        <CallControls onLeave={() => handleLeaveCall()} />
        <Dialog open={dialogOpen}>
          <DialogTitle>Meeting ID</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Share this Meeting ID with others to let them join the call.
            </DialogContentText>
            <TextField
              value={callId}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => navigator.clipboard.writeText(callId)}>
              Copy
            </Button>
            <Button onClick={onCloseDialog} color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </StreamTheme>
    );
  }
);

const CreateMeeting = () => {
  const { client, user } = useVideoClient(); // Extract user from context
  const [call, setCall] = useState(null);
  const [callId, setCallId] = useState(localStorage.getItem("callId") || "");
  const [dialogOpen, setDialogOpen] = useState(true);

  const hasInitializedRef = useRef(false);

  // Function to send data to the server
  const sendMeetingDataToServer = useCallback(async (meetingId, userId) => {
    try {
      console.log("Sending meeting data to server with ID:", meetingId);
      const response = await fetch("http://localhost:3002/api/meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ callId: meetingId, userId }), // Ensure the key names match what the server expects
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get the error message from the server
        throw new Error(`Failed to send meeting data to server: ${errorText}`);
      }

      console.log("Meeting data sent successfully");
    } catch (error) {
      console.error("Error sending meeting data:", error);
    }
  }, []);

  // Function to create and join the meeting
  const handleCreateMeeting = useCallback(async () => {
    if (!client || !user) {
      console.error("StreamVideoClient or user is not initialized.");
      return;
    }

    const callType = "default";
    const newCallId = generateCallId();
    setCallId(newCallId);
    localStorage.setItem("callId", newCallId);

    if (!call) {
      try {
        const newCall = client.call(callType, newCallId);
        await newCall.getOrCreate();
        await newCall.join();
        console.log("Call created and joined successfully:", newCall);
        setCall(newCall); // Update the call state

        // Send meeting ID and user ID to the server
        await sendMeetingDataToServer(newCallId, user.id);
      } catch (error) {
        console.error("Error creating or joining call:", error);
        // Handle error (show message, retry, etc.)
      }
    }
  }, [client, call, user, sendMeetingDataToServer]);

  // useEffect to handle meeting creation on component mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      handleCreateMeeting(); // Call the function to create and join the meeting
      hasInitializedRef.current = true; // Set the ref to true to avoid re-running
    }
  }, [handleCreateMeeting]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div className="create-meeting-page">
      <div className="main-content">
        {call ? (
          <StreamCall call={call}>
            <MyUILayout
              client={client}
              call={call}
              callId={callId}
              dialogOpen={dialogOpen}
              onCloseDialog={handleCloseDialog}
            />
          </StreamCall>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default CreateMeeting;
