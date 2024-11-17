import { useNavigate } from "@remix-run/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "~/components/scenario/header";
import { MessagesArea } from "~/components/scenario/messages-area";
import { RecordingControls } from "~/components/scenario/recording-controls";
import { ScenarioContext } from "~/scenario.context";
import { RecordingService } from "~/lib/recording-service";

export function ScenarioView() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
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
          setIsRecording(false);
          setRecordingDuration(0);
        }
      );
      setIsRecording(success);
    } else {
      recordingServiceRef.current.stopRecording();
    }
  }, [send]);

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header
        scenarioDetails={ScenarioContext.useSelector((state) => ({
          type: state.public.type,
          title: state.public.title,
          prompt: state.public.prompt,
          nativeLanguage: state.public.nativeLanguage,
          targetLanguage: state.public.targetLanguage,
        }))}
        onBack={() => navigate("/")}
      />

      <MessagesArea
        messages={ScenarioContext.useSelector((state) => state.public.messages)}
        isGeneratingResponse={ScenarioContext.useMatches({
          IsGenerating: "True",
        })}
      />

      <RecordingControls
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        onRecordingChange={handleRecordingChange}
        onDurationChange={setRecordingDuration}
      />
    </div>
  );
}
