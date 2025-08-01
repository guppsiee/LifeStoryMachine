"use client";

import { useState } from 'react';

export default function RecordingComponent() {
  const [isRecording, setIsRecording] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Click "Start Recording" to begin.');

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setStatusMessage('Recording in progress...');
    } else {
      setStatusMessage('Recording stopped. Processing...');
      // Simulate processing
      setTimeout(() => {
        setStatusMessage('Your story has been sent to your email.');
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <p className="text-lg text-gray-600">{statusMessage}</p>
      </div>
      <div className="flex items-center justify-center space-x-4">
        {isRecording && (
          <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
        )}
        <button
          onClick={handleToggleRecording}
          className={`px-8 py-4 text-lg font-semibold text-white rounded-full shadow-lg transition-transform transform hover:scale-105 ${
            isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
    </div>
  );
} 