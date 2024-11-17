import type { Meta, StoryObj } from "@storybook/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { RecordingService } from "./recording-service";

// Helper function to convert PCM16 base64 back to Float32Array
async function base64ToPCM16(base64: string): Promise<Float32Array> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert PCM16 to Float32Array
  const pcm16Data = new Int16Array(bytes.buffer);
  const float32Data = new Float32Array(pcm16Data.length);
  for (let i = 0; i < pcm16Data.length; i++) {
    float32Data[i] = pcm16Data[i] / 0x8000;
  }

  return float32Data;
}

// Helper function to concatenate and play PCM chunks
async function playPCMChunks(chunks: string[]): Promise<AudioBufferSourceNode> {
  const audioContext = new AudioContext();
  
  // Convert all chunks to Float32Arrays
  const float32Arrays = await Promise.all(chunks.map(base64ToPCM16));
  
  // Calculate total length
  const totalLength = float32Arrays.reduce((acc, arr) => acc + arr.length, 0);
  
  // Create a single Float32Array with all the data
  const combinedArray = new Float32Array(totalLength);
  let offset = 0;
  for (const arr of float32Arrays) {
    combinedArray.set(arr, offset);
    offset += arr.length;
  }
  
  // Create an AudioBuffer
  const audioBuffer = audioContext.createBuffer(1, combinedArray.length, audioContext.sampleRate);
  audioBuffer.getChannelData(0).set(combinedArray);
  
  // Create and configure source node
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  
  return source;
}

function RecordingServiceTester() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const recordingServiceRef = useRef<RecordingService | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (recordingServiceRef.current) {
        recordingServiceRef.current.stopRecording();
      }
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }
    };
  }, []);

  const handleStartRecording = useCallback(async () => {
    if (!recordingServiceRef.current) {
      recordingServiceRef.current = new RecordingService();
    }

    setError(null);
    setAudioChunks([]);

    try {
      const success = await recordingServiceRef.current.startRecording(
        (base64Chunk) => {
          setAudioChunks((chunks) => [...chunks, base64Chunk]);
        },
        () => {
          setIsRecording(false);
        }
      );

      if (success) {
        setIsRecording(true);
      } else {
        setError("Failed to start recording");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    if (recordingServiceRef.current) {
      recordingServiceRef.current.stopRecording();
    }
  }, []);

  const handleStopPlayback = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  const handlePlayAllChunks = useCallback(async () => {
    try {
      handleStopPlayback();

      const source = await playPCMChunks(audioChunks);
      audioSourceRef.current = source;

      source.addEventListener('ended', () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
      }, { once: true });

      source.start();
      setIsPlaying(true);
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  }, [audioChunks, handleStopPlayback]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <Button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          variant={isRecording ? "destructive" : "default"}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
        {audioChunks.length > 0 && (
          <Button
            onClick={() => {
              if (isPlaying) {
                handleStopPlayback();
              } else {
                handlePlayAllChunks();
              }
            }}
            variant="outline"
          >
            {isPlaying ? "Stop Playback" : "Play Recording"}
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          Error: {error}
        </div>
      )}

      {audioChunks.length > 0 && (
        <div className="p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Debug Info</h3>
          <div className="text-sm text-gray-600">
            <p>Total chunks: {audioChunks.length}</p>
            <p>
              Total size:{" "}
              {Math.round(
                audioChunks.reduce((acc, chunk) => acc + chunk.length, 0) / 1024
              )}{" "}
              KB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const meta = {
  title: "Services/RecordingService",
  component: RecordingServiceTester,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RecordingServiceTester>;

export default meta;
type Story = StoryObj<typeof RecordingServiceTester>;

export const Default: Story = {};
