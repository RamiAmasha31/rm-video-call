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
  const { client } = useVideoClient();
  const [call, setCall] = useState(null);
  const [callId, setCallId] = useState(localStorage.getItem("callId") || "");
  const [dialogOpen, setDialogOpen] = useState(true);

  const hasInitializedRef = useRef(false);

  // Function to create and join the meeting
  const handleCreateMeeting = useCallback(async () => {
    if (!client) {
      console.error("StreamVideoClient is not initialized.");
      return;
    }

    const callType = "default";
    const newCallId = callId || generateCallId();
    setCallId(newCallId);
    localStorage.setItem("callId", newCallId);

    if (!call) {
      try {
        const newCall = client.call(callType, newCallId);
        await newCall.getOrCreate();
        await newCall.join();
        console.log("Call created and joined successfully:", newCall);
        setCall(newCall); // Update the call state
      } catch (error) {
        console.error("Error creating or joining call:", error);
        // Handle error (show message, retry, etc.)
      }
    }
  }, [client, call, callId]);

  // useEffect to handle meeting creation on component mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      console.log("im in use effect");
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
