"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import { RecordingService } from "~/lib/recording-service";

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
  scenarioId: string;
  onAudioChunk?: (chunk: string, scenarioId: string) => void;
  onAudioComplete?: (scenarioId: string) => void;
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

// This is a very short beep sound encoded in base64
const SAMPLE_AUDIO_BASE64 = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Hh4NtVkdUc4eQkIdyWDpHX3qNmpqVdVEzPl17laeqpJNkNyQ6YIqjt7i0nXhPLDFTcZOqvL67rI1hQkdpgZuuvcC9taJ6WFRuk6Szv8PBvLOkhGxkfJqsu8PFxcC4rJB5aXeRpLXBxsfFv7mklHt2jZ+xuMPKysjEv7SdiYN+k6i3xMvOzcnGwLKdjoaEnbPAyc/S0s7LxbyphYeHnrXDzdPX2dXRy8CujIyLobrH0dfb3dnW0ce3mZKPqL/M1drd3t3a1s7CpZmVqsTR2d7g4eDe2tHIsp2dscrW3eHj5OPh3tfQvaeisczY3+Pm5+bl4t3VyLOqsc7a4OXo6eno5eDazL23wtPd5Onr7Ozr6OPe1MW+yNjj6e3v8PDv7Ofe2s/Hztvm7PDy8/Py8Ovk39nT2uPq8PL09fX19PDq5ODb3+jv8/b4+Pj49/Xw6+fj5u3z9/n6+vr6+fb08e3q7fP3+vv8/Pz8+/n39PLw8/j6/P3+/v7+/fz7+Pb1+Pr8/f7//////v79/Pr5+vv9/v///////////v7+/v7+/v////////////7+/v79/f39/f7+//////7+/v79/f39/f39/v7+//7+/v79/f39/f39/f7+/v7+/v79/f39/f39/f39/v7+/v7+/f39/f39/f39/f7+/v7+/v39/f39/f39/f3+/v7+/v79/f39/f39/f39/v7+/v7+/f39/f39/f39/f7+/v7+/v39/f39/f39/f3+/v7+/v79/f39/f39/f39/v7+/v7+/f39/f39/f39/f7+/v7+/v39/f39/f39/f3+/v7+/v79/f39/f39/f39/v7+/v7+/f39/f39/f39/f7+/v7+/v39/f39/f39/f0=";

const generateWaveform = (length: number = 64) => {
  return Array.from({ length }, (_, i) => {
    const position = i / length;
    const frequency = 2;
    const amplitude = Math.sin(position * Math.PI * frequency);
    return 0.3 + Math.abs(amplitude) * 0.7;
  });
};

export const ChatScreen = ({
  messages: externalMessages,  // Rename to avoid confusion
  onPlayAudio,
  onPauseAudio,
  defaultIsPromptOpen = true,
  onStartConversation,
  scenarioId,
  onAudioChunk,
  onAudioComplete,
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

  const recordingService = useRef<RecordingService>();
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout>();

  // Ensure AI starts the conversation with audio
  const [messages, setMessages] = useState(externalMessages);

  const displayMessages = useMemo(() => {
    if (messages.length === 0) {
      const initialWaveform = generateWaveform(64);
      return [{
        id: "initial-message",
        author: { id: "ai-1", isAI: true },
        timestamp: new Date(),
        audio: {
          id: "audio-initial",
          audioUrl: SAMPLE_AUDIO_BASE64,
          duration: 1,
          waveform: initialWaveform,
        },
      }];
    }
    return messages;
  }, [messages]);

  // Initialize audio elements when messages change
  useEffect(() => {
    const newAudioElements: Record<string, HTMLAudioElement> = {};
    
    displayMessages.forEach(message => {
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
  }, [displayMessages]);

  useEffect(() => {
    recordingService.current = new RecordingService();
    return () => {
      // Cleanup
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  const handlePlayPause = async (audioId: string) => {
    const audioElement = audioElements[audioId];
    if (!audioElement) {
      console.error('No audio element found for id:', audioId);
      return;
    }

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
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setCurrentlyPlaying(audioId);
            onPlayAudio?.(audioId);
          }).catch(error => {
            console.error("Error playing audio:", error);
          });
        }
      }
    } catch (error) {
      console.error("Error in handlePlayPause:", error);
    }
  };

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const renderAudioControls = (messageId: string, duration: number) => {
    return (
      <div className="flex-1 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full",
            "transition-colors duration-200",
            currentlyPlaying === messageId
              ? "text-blue-600 bg-blue-100 hover:bg-blue-200"
              : "hover:bg-blue-100"
          )}
          onClick={() => handlePlayPause(messageId)}
        >
          {currentlyPlaying === messageId ? (
            <PauseCircle className="h-6 w-6" />
          ) : (
            <PlayCircle className="h-6 w-6" />
          )}
        </Button>
        
        <span className="text-sm tabular-nums ml-2 text-gray-500">
          {formatDuration(duration)}
        </span>
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

  const startRecording = async () => {
    try {
      await recordingService.current?.startRecording();
      setIsRecording(true);
      
      // Start timer
      const startTime = Date.now();
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      // You might want to show an error message to the user here
    }
  };

  const stopRecording = async () => {
    try {
      const audio = await recordingService.current?.stopRecording();
      setIsRecording(false);
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        setRecordingDuration(0);
      }

      if (audio) {
        console.log('Recording completed, waveform:', audio.waveform); // Debug log
        
        // Create a new message for local display
        const newMessage = {
          id: `msg-${Date.now()}`,
          author: { id: 'user-1', isAI: false },
          timestamp: new Date(),
          audio: {
            id: `audio-${Date.now()}`,
            audioUrl: audio.url,
            duration: recordingDuration || 1,
            waveform: audio.waveform, // Make sure this is being passed correctly
          },
        };

        // Set up audio element for playback
        const audioElement = new Audio();
        audioElement.src = audio.url;
        audioElement.preload = "auto";
        
        audioElement.addEventListener("timeupdate", () => {
          setProgress(prev => ({
            ...prev,
            [newMessage.audio.id]: audioElement.currentTime / audioElement.duration
          }));
        });
        
        audioElement.addEventListener("ended", () => {
          setCurrentlyPlaying(null);
          setProgress(prev => ({
            ...prev,
            [newMessage.audio.id]: 0
          }));
        });
        
        // Add to UI state
        setAudioElements(prev => ({
          ...prev,
          [newMessage.audio.id]: audioElement
        }));
        
        console.log('Adding new message:', newMessage); // Debug log
        setMessages(prevMessages => [...prevMessages, newMessage]);

        // Send to server
        if (onAudioChunk && onAudioComplete) {
          const base64 = audio.base64;
          const chunkSize = 32 * 1024;
          for (let i = 0; i < base64.length; i += chunkSize) {
            const chunk = base64.slice(i, i + chunkSize);
            onAudioChunk(chunk, scenarioId);
          }
          onAudioComplete(scenarioId);
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Initialize messages with waveform data
  useEffect(() => {
    // Add waveform data to any messages that don't have it
    const messagesWithWaveforms = externalMessages.map(message => ({
      ...message,
      audio: {
        ...message.audio,
        waveform: message.audio.waveform || generateWaveform(64)
      }
    }));
    setMessages(messagesWithWaveforms);
  }, [externalMessages]);

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
          {displayMessages.map((message) => (
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

              {renderAudioControls(message.audio.id, message.audio.duration)}
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
              onClick={isRecording ? stopRecording : startRecording}
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
                <span className="text-sm text-gray-500 ml-auto">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
