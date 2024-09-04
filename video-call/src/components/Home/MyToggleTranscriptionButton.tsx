import {
  useCall,
  useCallStateHooks,
  TranscriptionSettingsRequestModeEnum,
} from "@stream-io/video-react-sdk";

export const MyToggleTranscriptionButton = () => {
  const call = useCall();
  const { useCallSettings, useIsCallTranscribingInProgress } =
    useCallStateHooks();
  const isTranscribing = useIsCallTranscribingInProgress();
  return (
    <button
      onClick={() => {
        if (isTranscribing) {
          call?.stopTranscription().catch((err) => {
            console.log("Failed to stop transcriptions", err);
          });
        } else {
          call?.startTranscription().catch((err) => {
            console.error("Failed to start transcription", err);
          });
        }
      }}
    >
      {isTranscribing ? "Stop transcription" : "Start transcription"}
    </button>
  );
};
