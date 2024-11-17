import { cn } from "~/lib/utils";
import { PlayCircle, PauseCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  author: {
    id: string;
    isAI?: boolean;
  };
  timestamp: number;
  audio: {
    id: string;
    audioUrl: string;
    duration: number;
  };
}

interface MessagesAreaProps {
  messages?: Message[];
  isGeneratingResponse?: boolean;
}

export function MessagesArea({ messages = [], isGeneratingResponse = true }: MessagesAreaProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = (audioId: string) => {
    if (currentlyPlaying === audioId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(audioId);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Initial Loading Message */}
        {messages.length === 0 && (
          <div className={cn(
            "group flex items-center gap-3 p-4 rounded-2xl transition-all",
            "ml-0 mr-12 bg-blue-50/80 text-blue-900 border-blue-100",
            "border shadow-sm"
          )}>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-sm font-medium">
              AI
            </div>
            <div className="flex-1 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                Thinking
                <span className="inline-flex w-4 justify-start">
                  <span className="animate-[ellipsis_1.5s_infinite]">...</span>
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Regular Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "group flex items-center gap-3 p-4 rounded-2xl transition-all",
              "hover:shadow-md",
              message.author.isAI 
                ? "ml-0 mr-12 bg-blue-50/80 text-blue-900 border-blue-100" 
                : "ml-12 mr-0 bg-indigo-50/80 text-indigo-900 border-indigo-100",
              "border shadow-sm"
            )}
          >
            {/* Avatar/Icon */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium",
              message.author.isAI 
                ? "bg-blue-100 text-blue-600"
                : "bg-indigo-100 text-indigo-600"
            )}>
              {message.author.isAI ? "AI" : "You"}
            </div>

            {/* Audio Controls */}
            <div className="flex-1 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full",
                  "transition-colors duration-200",
                  currentlyPlaying === message.audio.id
                    ? "text-blue-600 bg-blue-100 hover:bg-blue-200"
                    : "hover:bg-blue-100"
                )}
                onClick={() => handlePlayPause(message.audio.id)}
              >
                {currentlyPlaying === message.audio.id ? (
                  <PauseCircle className="h-6 w-6" />
                ) : (
                  <PlayCircle className="h-6 w-6" />
                )}
              </Button>
              
              <span className="text-sm tabular-nums ml-2 text-gray-500">
                {formatDuration(message.audio.duration)}
              </span>
            </div>
          </div>
        ))}

        {/* Show generating state for next response */}
        {isGeneratingResponse && messages.length > 0 && (
          <div className={cn(
            "group flex items-center gap-3 p-4 rounded-2xl transition-all",
            "ml-0 mr-12 bg-blue-50/80 text-blue-900 border-blue-100",
            "border shadow-sm opacity-80"
          )}>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-sm font-medium">
              AI
            </div>
            <div className="flex-1 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                Thinking
                <span className="inline-flex w-4 justify-start">
                  <span className="animate-[ellipsis_1.5s_infinite]">...</span>
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 