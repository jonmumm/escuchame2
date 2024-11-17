import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RecordingControls } from "./recording-controls";
import { useState, useEffect } from "react";

const meta = {
  title: "Scenario/RecordingControls",
  component: RecordingControls,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RecordingControls>;

export default meta;
type Story = StoryObj<typeof RecordingControls>;

export const Idle: Story = {
  args: {
    isRecording: false,
    recordingDuration: 0,
    onRecordingChange: () => console.log("Recording state changed"),
    onDurationChange: () => console.log("Duration changed"),
  },
};

export const Recording: Story = {
  args: {
    isRecording: true,
    recordingDuration: 15,
    onRecordingChange: () => console.log("Recording state changed"),
    onDurationChange: () => console.log("Duration changed"),
  },
};

// Interactive story that simulates real recording behavior
export const Interactive: Story = {
  render: function Wrapper() {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isRecording) {
        interval = setInterval(() => {
          setDuration(d => d + 1);
        }, 1000);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isRecording]);

    return (
      <RecordingControls
        isRecording={isRecording}
        recordingDuration={duration}
        onRecordingChange={(recording) => {
          setIsRecording(recording);
          if (!recording) setDuration(0);
        }}
        onDurationChange={setDuration}
      />
    );
  },
}; 