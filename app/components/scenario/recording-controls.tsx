import { Button } from "~/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { cn } from "~/lib/utils";

interface RecordingControlsProps {
  isRecording: boolean;
  recordingDuration: number;
  onRecordingChange: (isRecording: boolean) => void;
  onDurationChange: (duration: number) => void;
}

export function RecordingControls({
  isRecording,
  recordingDuration,
  onRecordingChange,
  onDurationChange,
}: RecordingControlsProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      onRecordingChange(false);
      onDurationChange(0);
    } else {
      onRecordingChange(true);
      // Start recording timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        onDurationChange(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Clean up timer when recording stops
      return () => clearInterval(timer);
    }
  };

  return (
    <div className="border-t dark:border-gray-800 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex justify-center items-center gap-4">
          <Button
            size="lg"
            className={cn(
              "rounded-full h-16 w-16 transition-all duration-300",
              isRecording 
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-blue-500 hover:bg-blue-600"
            )}
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
  );
} 