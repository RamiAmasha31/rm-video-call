import React, { useCallback, useEffect, useRef, useState } from "react";
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
import CircularProgress from "@mui/material/CircularProgress";
import "./CreateMeeting.css";

const generateCallId = () => `call-${Math.random().toString(36).substr(2, 9)}`;

const MyUILayout = React.memo(
  ({ client, call, callId, dialogOpen, onCloseDialog, onSetLoading }) => {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();
    const navigate = useNavigate();

    const fetchParticipants = async (callId) => {
      try {
        const response = await fetch(
          `http://localhost:3002/api/meeting/${callId}/participants`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch participants: ${errorText}`);
        }

        const participants = await response.json();
        console.log("Participants:", participants);
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    const handleLeaveCall = useCallback(async () => {
      if (call) {
        try {
          console.log("Leaving call with ID:", callId);
          onSetLoading(true); // Set loading to true before processing

          // Fetch participants before ending the call
          await fetchParticipants(callId);

          // End the call
          await call.endCall();

          // Delay to allow the recording to be available
          await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait for 30 seconds

          // Fetch and send recordings in the background
          const fetchAndSendRecordings = async (retries = 3) => {
            try {
              const recordingsResponse = await call.queryRecordings();
              const recordings = recordingsResponse.recordings;

              if (recordings.length > 0) {
                await Promise.all(
                  recordings.map(async (recording) => {
                    const { url } = recording;
                    // console.log(url);
                    await sendRecordingDataToServer(callId, url);
                  })
                );
              } else {
                console.warn("No recordings found.");
              }
            } catch (error) {
              if (retries > 0) {
                console.warn("Retry fetching recordings in 5 seconds...");
                await new Promise((resolve) => setTimeout(resolve, 5000)); // Retry after 5 seconds
                return fetchAndSendRecordings(retries - 1); // Retry
              } else {
                console.error(
                  "Failed to fetch recordings after multiple attempts:",
                  error
                );
              }
            }
          };

          // Ensure background task starts after navigation
          setTimeout(() => {
            fetchAndSendRecordings();
          }, 1000); // Delay for navigation

          navigate("/home");
        } catch (error) {
          console.error("Error during leaving the call:", error);
        } finally {
          onSetLoading(false); // Set loading to false after processing
        }
      }
    }, [call, callId, navigate, onSetLoading]);

    const sendRecordingDataToServer = async (callId, url) => {
      try {
        console.log(
          "Sending recording data to server with Call ID:",
          callId,
          "and URL:",
          url
        );
        const response = await fetch("http://localhost:3002/api/recording", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callId, url }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to send recording data to server: ${errorText}`
          );
        }

        console.log("Recording data sent successfully");
      } catch (error) {
        console.error("Error sending recording data:", error);
      }
    };

    if (callingState !== CallingState.JOINED) {
      return (
        <div className="loading-container">
          <CircularProgress className="loading-icon" />
        </div>
      );
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
              InputProps={{ readOnly: true }}
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
  const { client, user } = useVideoClient();
  const [call, setCall] = useState(null);
  const [callId, setCallId] = useState(localStorage.getItem("callId") || "");
  const [dialogOpen, setDialogOpen] = useState(true);
  const [loading, setLoading] = useState(true); // Start with loading state

  const hasInitializedRef = useRef(false);

  const sendMeetingDataToServer = useCallback(async (meetingId, userId) => {
    try {
      console.log("Sending meeting data to server with ID:", meetingId);
      const response = await fetch("http://localhost:3002/api/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId: meetingId, userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send meeting data to server: ${errorText}`);
      }

      console.log("Meeting data sent successfully");
    } catch (error) {
      console.error("Error sending meeting data:", error);
    }
  }, []);

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
        setCall(newCall);

        // Send meeting ID and user ID to the server
        await sendMeetingDataToServer(newCallId, user.id);
      } catch (error) {
        console.error("Error creating or joining call:", error);
      }
    }
  }, [client, call, user, sendMeetingDataToServer]);

  useEffect(() => {
    if (client && user && !hasInitializedRef.current) {
      if (callId) {
        // Rejoin existing call
        const rejoinCall = async () => {
          try {
            const existingCall = client.call("default", callId);
            await existingCall.getOrCreate();
            await existingCall.join();
            setCall(existingCall);
          } catch (error) {
            console.error("Error rejoining call:", error);
          }
        };
        rejoinCall();
      } else {
        handleCreateMeeting();
      }
      hasInitializedRef.current = true;
      setLoading(false); // Set loading to false when initialized
    }
  }, [client, user, callId, handleCreateMeeting]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div className="create-meeting-page">
      <div className="main-content">
        {loading ? (
          <Dialog open={loading}>
            <DialogTitle>Loading</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please wait while we set up your meeting.
              </DialogContentText>
              <CircularProgress />
            </DialogContent>
          </Dialog>
        ) : (
          <>
            {call ? (
              <StreamCall call={call}>
                <MyUILayout
                  client={client}
                  call={call}
                  callId={callId}
                  dialogOpen={dialogOpen}
                  onCloseDialog={handleCloseDialog}
                  onSetLoading={setLoading}
                />
              </StreamCall>
            ) : (
              <div className="loading-container">
                <CircularProgress className="loading-icon" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreateMeeting;
