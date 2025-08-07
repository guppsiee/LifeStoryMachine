"use client";

import { useState, useEffect } from 'react';
import useRecorder from '../hooks/useRecorder';

export default function RecordingComponent({ onNewRecording }) {
  const { isStarting, isRecording, audioBlob, recorderError, startRecording, stopRecording, clearAudioBlob } = useRecorder();
  const [statusMessage, setStatusMessage] = useState('Click "Start Recording" to begin.');
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
    }
  }, [recorderError, isStarting, isRecording, isProcessing]);

  const sendAudio = async (blob) => {
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
      onNewRecording(data.sessionHistory.segments.join('\\n'));
      setStatusMessage('Segment processed successfully.');
    } catch (error) {
      console.error('Error sending audio:', error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      clearAudioBlob();
      setTimeout(() => {
        if (!isRecording && !isProcessing && !recorderError) {
          setStatusMessage('Click "Start Recording" to begin.');
        }
      }, 3000);
    }
  };

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
  }, [audioBlob]);

  const getButtonText = () => {
    if (recorderError) return 'Try Again';
    if (isStarting) return 'Starting...';
    if (isRecording) return 'Stop Recording';
    if (isProcessing) return 'Processing...';
    return 'Start Recording';
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <p className="text-lg text-gray-600">{statusMessage}</p>
      </div>
      <div className="flex items-center justify-center space-x-4">
        {(isRecording || isProcessing || isStarting) && !recorderError && (
          <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
        )}
        <button
          onClick={handleToggleRecording}
          disabled={isProcessing || isStarting || recorderError}
          className={`px-8 py-4 text-lg font-semibold text-white rounded-full shadow-lg transition-transform transform hover:scale-105 ${
            isRecording && !recorderError ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary/90'
          } ${isProcessing || isStarting || recorderError ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
} 