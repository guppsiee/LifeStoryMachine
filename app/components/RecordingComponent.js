"use client";

import { useState, useEffect, useCallback } from 'react';
import useRecorder from '../hooks/useRecorder';
import { Mic, Square } from 'lucide-react';

export default function RecordingComponent({ onNewRecording }) {
  const { isStarting, isRecording, audioBlob, recorderError, startRecording, stopRecording, clearAudioBlob } = useRecorder();
  const [statusMessage, setStatusMessage] = useState('Ready to record your story');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (recorderError) {
      setStatusMessage(recorderError);
    } else if (isStarting) {
      setStatusMessage('Initializing microphone...');
    } else if (isRecording) {
      setStatusMessage('Recording in progress...');
    } else if (isProcessing) {
      setStatusMessage('Processing your story...');
    } else {
      setStatusMessage('Ready to record your story');
    }
  }, [recorderError, isStarting, isRecording, isProcessing]);

  const sendAudio = useCallback(async (blob) => {
    if (!blob) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('audio', blob, 'story.webm');

    try {
      const response = await fetch('/api/process-segment', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process audio');
      }

      const data = await response.json();
      // Use the new transcript to append to existing content
      onNewRecording(data.newTranscript);
      setStatusMessage('Segment processed successfully.');
    } catch (error) {
      console.error('Error sending audio:', error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      clearAudioBlob();
      setTimeout(() => {
        if (!isRecording && !isProcessing && !recorderError) {
          setStatusMessage('Ready to record your story');
        }
      }, 3000);
    }
  }, [onNewRecording, clearAudioBlob, isRecording, isProcessing, recorderError]);

  const handleToggleRecording = () => {
    if (!isRecording && !isStarting) {
      startRecording();
    } else if (isRecording) {
      stopRecording();
    }
  };

  useEffect(() => {
    if (audioBlob) {
      sendAudio(audioBlob);
    }
  }, [audioBlob, sendAudio]);

  const buttonText = isRecording ? 'Stop Recording' : 'Start Recording';
  const ButtonIcon = isRecording ? Square : Mic;

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <div className={`flex items-center justify-center h-24 w-24 rounded-full ${isRecording ? 'bg-red-100' : 'bg-blue-100'}`}>
        <Mic className={`h-12 w-12 ${isRecording ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
      </div>
      <p className="text-xl text-neutral-600">{statusMessage}</p>
      <button
        onClick={handleToggleRecording}
        disabled={isProcessing || isStarting || recorderError}
        className={`flex items-center space-x-2 px-8 py-3 text-lg font-semibold rounded-lg shadow-md transition-all ${
          isRecording 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        } ${isProcessing || isStarting || recorderError ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ButtonIcon className="h-5 w-5" />
        <span>{buttonText}</span>
      </button>
    </div>
  );
} 