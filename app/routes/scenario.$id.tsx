import type { MetaFunction } from "@remix-run/cloudflare";
import { useNavigate, useParams } from "@remix-run/react";
import { useState } from "react";
import { Header } from "../components/scenario/header";
import { MessagesArea } from "../components/scenario/messages-area";
import { RecordingControls } from "../components/scenario/recording-controls";
import { ScenarioContext } from "../scenario.context";

export const meta: MetaFunction = () => {
  return [{ title: "Escuchame - Conversation" }];
};

export default function ScenarioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const scenarioDetails = ScenarioContext.useSelector(state => ({
    type: state.public.type,
    title: state.public.title,
    description: state.public.description,
    prompt: state.public.prompt,
    nativeLanguage: state.public.nativeLanguage,
    targetLanguage: state.public.targetLanguage,
  }));
  
  const messages = ScenarioContext.useSelector(state => state.public.messages);
  const isGeneratingResponse = ScenarioContext.useSelector(state => state.public.isGeneratingResponse);

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header scenarioDetails={scenarioDetails} onBack={() => navigate("/")} />

      <MessagesArea 
        messages={messages}
        isGeneratingResponse={isGeneratingResponse}
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
