"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Drawer } from "vaul";
import { cn } from "~/lib/utils";
import { PlayCircle, PauseCircle, Mic, MicOff, Globe2, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface AudioMessage {
  id: string;
  audioUrl: string;
  duration: number;
  waveform?: number[];
}

interface ChatScreenProps {
  messages: Array<{
    id: string;
    author: {
      id: string;
      isAI?: boolean;
    };
    timestamp: Date;
    audio: AudioMessage;
  }>;
  onPlayAudio?: (audioId: string) => void;
  onPauseAudio?: (audioId: string) => void;
  defaultIsPromptOpen?: boolean;
  onStartConversation?: (prompt: string, nativeLanguage: string, targetLanguage: string) => void;
}

const languages = [
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugués' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

const conversationSuggestions = [
  {
    title: "At the Café",
    description: "Practice ordering drinks and food at a coffee shop",
    icon: "☕",
  },
  {
    title: "Getting Directions",
    description: "Learn to ask for and understand directions in the city",
    icon: "🗺️",
  },
  {
    title: "Making Friends",
    description: "Basic introductions and small talk with new people",
    icon: "👋",
  },
  {
    title: "Shopping",
    description: "Asking about prices, sizes, and making purchases",
    icon: "🛍️",
  },
  {
    title: "Restaurant",
    description: "Ordering food and making reservations at restaurants",
    icon: "🍽️",
  },
];

const getRandomSuggestion = () => {
  const randomIndex = Math.floor(Math.random() * conversationSuggestions.length);
  return conversationSuggestions[randomIndex];
};

// Sample audio URLs - these should be actual MP3 files in your public directory
const SAMPLE_AUDIO_URLS = {
  greeting: "https://audio-samples.github.io/samples/mp3/spanish-greeting.mp3",
  question: "https://audio-samples.github.io/samples/mp3/spanish-question.mp3",
  response: "https://audio-samples.github.io/samples/mp3/spanish-response.mp3",
};

export const ChatScreen = ({
  messages: externalMessages,  // Rename to avoid confusion
  onPlayAudio,
  onPauseAudio,
  defaultIsPromptOpen = true,
  onStartConversation,
}: ChatScreenProps) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState(languages[1]); // English default
  const [targetLanguage, setTargetLanguage] = useState(languages[0]); // Spanish default
  const [isPromptOpen, setIsPromptOpen] = useState(defaultIsPromptOpen);

  // Keep track of audio elements
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});

  // Add progress tracking for waveform animation
  const [progress, setProgress] = useState<Record<string, number>>({});
  const animationFrameRef = useRef<number>();

  // Ensure AI starts the conversation with audio
  const messages = useMemo(() => {
    if (externalMessages.length === 0) {
      return [{
        id: "initial-message",
        author: { id: "ai-1", isAI: true },
        timestamp: new Date(),
        audio: {
          id: "audio-initial",
          audioUrl: SAMPLE_AUDIO_URLS.greeting,
          duration: 8, // 8 seconds for greeting
          waveform: Array(50).fill(0).map(() => 0.5 + Math.random() * 0.5),
        },
      }];
    }
    return externalMessages.map((msg, index) => ({
      ...msg,
      audio: {
        ...msg.audio,
        // Alternate between different sample audios
        audioUrl: msg.author.isAI 
          ? SAMPLE_AUDIO_URLS.question 
          : SAMPLE_AUDIO_URLS.response,
      }
    }));
  }, [externalMessages]);

  // Initialize audio elements when messages change
  useEffect(() => {
    const newAudioElements: Record<string, HTMLAudioElement> = {};
    
    messages.forEach(message => {
      if (!audioElements[message.audio.id]) {
        const audio = new Audio();
        audio.src = message.audio.audioUrl;
        audio.preload = "auto";
        
        audio.addEventListener("timeupdate", () => {
          setProgress(prev => ({
            ...prev,
            [message.audio.id]: audio.currentTime / audio.duration
          }));
        });
        
        audio.addEventListener("ended", () => {
          setCurrentlyPlaying(null);
          setProgress(prev => ({
            ...prev,
            [message.audio.id]: 0
          }));
        });
        
        newAudioElements[message.audio.id] = audio;
      }
    });

    setAudioElements(prev => ({
      ...prev,
      ...newAudioElements
    }));

    // Cleanup function
    return () => {
      Object.values(newAudioElements).forEach(audio => {
        audio.pause();
        audio.src = "";
      });
    };
  }, [messages]);

  const handlePlayPause = async (audioId: string) => {
    const audioElement = audioElements[audioId];
    if (!audioElement) return;

    try {
      if (currentlyPlaying === audioId) {
        audioElement.pause();
        setCurrentlyPlaying(null);
        onPauseAudio?.(audioId);
      } else {
        // Stop any currently playing audio
        if (currentlyPlaying && audioElements[currentlyPlaying]) {
          audioElements[currentlyPlaying].pause();
          audioElements[currentlyPlaying].currentTime = 0;
        }

        audioElement.currentTime = 0; // Reset to start
        await audioElement.play();
        setCurrentlyPlaying(audioId);
        onPlayAudio?.(audioId);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderWaveform = (messageId: string, waveform?: number[]) => {
    if (!waveform) return null;
    
    const currentProgress = progress[messageId] || 0;
    const progressIndex = Math.floor(waveform.length * currentProgress);
    
    return (
      <div className="flex items-center h-full gap-0.5">
        {waveform.map((amplitude, i) => (
          <div
            key={i}
            className={cn(
              "w-0.5 rounded-full transition-all duration-200",
              i <= progressIndex && currentlyPlaying === messageId
                ? "opacity-100"
                : "opacity-50",
              currentlyPlaying === messageId
                ? i <= progressIndex
                  ? "bg-blue-600"
                  : "bg-current"
                : "bg-current"
            )}
            style={{
              height: `${Math.max(15, amplitude * 32)}px`,
            }}
          />
        ))}
      </div>
    );
  };

  const handleStartConversation = () => {
    if (prompt.trim()) {
      onStartConversation?.(
        prompt,
        nativeLanguage.code,
        targetLanguage.code
      );
      setIsPromptOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: typeof conversationSuggestions[0]) => {
    setPrompt(`I want to practice ${suggestion.title.toLowerCase()}: ${suggestion.description}`);
  };

  const handleGetLucky = () => {
    const suggestion = getRandomSuggestion();
    setPrompt(`I want to practice ${suggestion.title.toLowerCase()}: ${suggestion.description}`);
  };

  return (
    <div className="h-[100dvh] bg-gradient-to-b from-gray-50 to-white">
      {/* Prompt Drawer */}
      <Drawer.Root open={isPromptOpen} onOpenChange={setIsPromptOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-white">
            <div className="flex-1 overflow-y-auto rounded-t-[10px] bg-white p-4">
              <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300" />
              
              <div className="mx-auto max-w-2xl space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Start a Conversation
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Choose your languages and describe what you'd like to practice
                  </p>
                </div>

                {/* Language Selection */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Native Language */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      I speak
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Globe2 className="h-4 w-4" />
                            <span>{nativeLanguage.name}</span>
                            <span className="text-gray-500">
                              ({nativeLanguage.nativeName})
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
                        {languages.map((lang) => (
                          <DropdownMenuItem
                            key={lang.code}
                            onSelect={() => setNativeLanguage(lang)}
                          >
                            <span>{lang.name}</span>
                            <span className="ml-2 text-gray-500">
                              ({lang.nativeName})
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Target Language */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      I want to practice
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Globe2 className="h-4 w-4" />
                            <span>{targetLanguage.name}</span>
                            <span className="text-gray-500">
                              ({targetLanguage.nativeName})
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
                        {languages.map((lang) => (
                          <DropdownMenuItem
                            key={lang.code}
                            onSelect={() => setTargetLanguage(lang)}
                          >
                            <span>{lang.name}</span>
                            <span className="ml-2 text-gray-500">
                              ({lang.nativeName})
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Get Lucky Button */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleGetLucky}
                      className={cn(
                        "bg-white hover:bg-blue-50 group",
                        "transition-all duration-300",
                        "border-2 hover:border-blue-500",
                        "px-6 py-3 rounded-full"
                      )}
                    >
                      <span className="flex items-center gap-2 text-base">
                        <span className="text-xl">🎲</span>
                        <span className="font-medium group-hover:text-blue-600">
                          Get Lucky
                        </span>
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Split View: Custom Prompt and Suggestions */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Custom Prompt */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      What would you like to practice?
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Example: I want to practice ordering coffee in a café"
                      className="w-full min-h-[120px] rounded-lg border border-gray-300 p-4 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                    <p className="text-sm text-gray-500">
                      You can write in either {nativeLanguage.name} or {targetLanguage.name}
                    </p>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Or try one of these conversations
                    </label>
                    <div className="space-y-2">
                      {conversationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg",
                            "border border-gray-200 hover:border-blue-500",
                            "transition-all duration-200",
                            "hover:shadow-md hover:scale-[1.02]",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500",
                            prompt.includes(suggestion.title.toLowerCase()) && 
                              "border-blue-500 bg-blue-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{suggestion.icon}</span>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {suggestion.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {suggestion.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  className="w-full py-6 text-lg"
                  onClick={handleStartConversation}
                  disabled={!prompt.trim()}
                >
                  Start Conversation
                </Button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center">
          <h1 className="text-lg font-semibold">Escuchame</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="pt-16 pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
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

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full shrink-0",
                  "transition-colors duration-200",
                  message.author.isAI
                    ? currentlyPlaying === message.audio.id
                      ? "text-blue-600 bg-blue-100 hover:bg-blue-200"
                      : "hover:bg-blue-100"
                    : currentlyPlaying === message.audio.id
                      ? "text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                      : "hover:bg-indigo-100"
                )}
                onClick={() => handlePlayPause(message.audio.id)}
              >
                {currentlyPlaying === message.audio.id ? (
                  <PauseCircle className="h-6 w-6" />
                ) : (
                  <PlayCircle className="h-6 w-6" />
                )}
              </Button>
              
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "h-8 rounded-full overflow-hidden",
                  "transition-colors duration-200",
                  message.author.isAI
                    ? currentlyPlaying === message.audio.id
                      ? "text-blue-600"
                      : "text-blue-900/50"
                    : currentlyPlaying === message.audio.id
                      ? "text-indigo-600"
                      : "text-indigo-900/50"
                )}>
                  {renderWaveform(message.audio.id, message.audio.waveform)}
                </div>
              </div>
              
              <span className={cn(
                "text-sm tabular-nums",
                message.author.isAI
                  ? currentlyPlaying === message.audio.id
                    ? "text-blue-600"
                    : "text-blue-900/40"
                  : currentlyPlaying === message.audio.id
                    ? "text-indigo-600"
                    : "text-indigo-900/40"
              )}>
                {formatDuration(message.audio.duration)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t">
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
              onClick={() => setIsRecording(!isRecording)}
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
              <div className="absolute left-4 right-4 bottom-24 p-4 bg-white rounded-lg shadow-lg border flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium">Recording...</span>
                <span className="text-sm text-gray-500 ml-auto">0:00</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
