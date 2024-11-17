import { useNavigate } from "@remix-run/react";
import { atom } from "nanostores";
import { useStore } from "@nanostores/react";
import { Header } from "~/components/scenario/header";
import { MessagesArea } from "~/components/scenario/messages-area";
import { RecordingControls } from "~/components/scenario/recording-controls";
import { ScenarioContext } from "~/scenario.context";
import { RecordingService } from "~/lib/recording-service";
import { useCallback, useEffect, useRef } from "react";

// Main component
export function ScenarioView() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ScenarioHeader onBack={() => navigate("/")} />
      <ScenarioMessages />
      <ScenarioRecordingArea />
    </div>
  );
}

// Header component
function ScenarioHeader({ onBack }: { onBack: () => void }) {
  const scenarioDetails = ScenarioContext.useSelector((state) => ({
    type: state.public.type,
    title: state.public.title,
    prompt: state.public.prompt,
    nativeLanguage: state.public.nativeLanguage,
    targetLanguage: state.public.targetLanguage,
  }));

  return <Header scenarioDetails={scenarioDetails} onBack={onBack} />;
}

// Messages component
function ScenarioMessages() {
  const messages = ScenarioContext.useSelector((state) => state.public.messages);
  const isGeneratingResponse = ScenarioContext.useMatches({
    IsGenerating: "True",
  });

  return (
    <MessagesArea
      messages={messages}
      isGeneratingResponse={isGeneratingResponse}
    />
  );
}

// Recording area component with internal stores
function ScenarioRecordingArea() {
  // Internal stores
  const isRecording$ = useRef(atom<boolean>(false)).current;
  const recordingDuration$ = useRef(atom<number>(0)).current;
  
  // Local state from stores
  const isRecording = useStore(isRecording$);
  const recordingDuration = useStore(recordingDuration$);
  
  const recordingServiceRef = useRef<RecordingService | null>(null);
  const send = ScenarioContext.useSend();

  useEffect(() => {
    recordingServiceRef.current = new RecordingService();
  }, []);

  const handleRecordingChange = useCallback(async (recording: boolean) => {
    if (!recordingServiceRef.current) return;

    if (recording) {
      const success = await recordingServiceRef.current.startRecording(
        // Handle each audio chunk
        (base64Chunk) => {
          send({
            type: "AUDIO_CHUNK_APPEND",
            audio: base64Chunk,
          });
        },
        // Handle recording complete
        () => {
          send({ type: "AUDIO_CHUNK_COMMIT" });
          send({ type: "GENERATE_RESPONSE" });
          isRecording$.set(false);
          recordingDuration$.set(0);
        }
      );
      isRecording$.set(success);
    } else {
      recordingServiceRef.current.stopRecording();
    }
  }, [send, isRecording$, recordingDuration$]);

  return (
    <RecordingControls
      isRecording={isRecording}
      recordingDuration={recordingDuration}
      onRecordingChange={handleRecordingChange}
      onDurationChange={(duration) => recordingDuration$.set(duration)}
    />
  );
}
