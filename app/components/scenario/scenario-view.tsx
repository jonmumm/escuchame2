import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { Header } from "~/components/scenario/header";
import { MessagesArea } from "~/components/scenario/messages-area";
import { RecordingControls } from "~/components/scenario/recording-controls";
import { ScenarioContext } from "~/scenario.context";

export function ScenarioView() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

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
        onRecordingChange={setIsRecording}
        onDurationChange={setRecordingDuration}
      />
    </div>
  );
}
