import { useParams, useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/cloudflare";
import { Button } from "~/components/ui/button";
import { Mic, MicOff, ChevronLeft } from "lucide-react";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [{ title: "Escuchame - Conversation" }];
};

type ScenarioDetails = {
  type: 'template' | 'custom' | 'lucky';
  title?: string;
  description?: string;
  prompt?: string;
  nativeLanguage: string;
  targetLanguage: string;
};

export default function ScenarioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // TODO: Get this from the scenario actor
  const scenarioDetails: ScenarioDetails = {
    type: "template",
    title: "At the Café",
    description: "Practice ordering drinks and food at a coffee shop",
    nativeLanguage: "English",
    targetLanguage: "Spanish",
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingDuration(0);
    } else {
      setIsRecording(true);
      // Start recording timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Clean up timer when recording stops
      return () => clearInterval(timer);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="p-4 border-b dark:border-gray-800">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex-1">
              {scenarioDetails.type === 'template' ? (
                <>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {scenarioDetails.title}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {scenarioDetails.description}
                  </p>
                </>
              ) : scenarioDetails.type === 'lucky' ? (
                <>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Random Conversation
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Let's practice something unexpected
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Custom Practice
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {scenarioDetails.prompt}
                  </p>
                </>
              )}
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{scenarioDetails.nativeLanguage}</span>
                <span>→</span>
                <span>{scenarioDetails.targetLanguage}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Messages will go here */}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="border-t dark:border-gray-800 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex justify-center items-center gap-4">
            <Button
              size="lg"
              className={`rounded-full h-16 w-16 transition-all duration-300
                ${isRecording 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-blue-500 hover:bg-blue-600"}`}
              onClick={handleToggleRecording}
            >
              {isRecording ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
              <span className="sr-only">
                {isRecording ? "Stop Recording" : "Start Recording"}
              </span>
            </Button>
            
            {isRecording && (
              <div className="absolute left-4 right-4 bottom-24 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium dark:text-white">Recording...</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 