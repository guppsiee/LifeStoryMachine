"use client";

import RecordingComponent from '../components/RecordingComponent';
import { useState, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AppPage() {
  const [sessionText, setSessionText] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/session');
        if (response.ok) {
          const data = await response.json();
          setSessionText(data.sessionHistory.segments.join('\\n'));
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
      }
    };
    fetchSession();
  }, []);

  const handleNewRecording = (newSessionText) => {
    setSessionText(newSessionText);
  };

  const handleResetSession = async () => {
    const promise = fetch('/api/session', { method: 'DELETE' });
    toast.promise(promise, {
      loading: 'Resetting session...',
      success: () => {
        setSessionText('');
        return 'Session has been reset.';
      },
      error: 'Failed to reset session.'
    });
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    const promise = fetch('/api/generate-story', { method: 'POST' })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => Promise.reject(data.message || 'Something went wrong'));
        }
        return res.json();
      });

    toast.promise(promise, {
      loading: 'Generating your story...',
      success: (data) => {
        setSessionText('');
        setIsGenerating(false);
        return data.message || 'Story sent! Check your email.';
      },
      error: (err) => {
        setIsGenerating(false);
        return `Error: ${err.toString()}`;
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-neutral-900">
            Life Story Machine
          </h1>
          <div className="space-x-4">
            <button
              onClick={handleGenerateStory}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              <Send className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Story'}
            </button>
            <button
              onClick={handleResetSession}
              className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md shadow-sm text-neutral-700 bg-white hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Reset Session
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-2xl font-bold mb-4 text-neutral-800">Record Your Story</h2>
                <RecordingComponent onNewRecording={handleNewRecording} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-2xl font-bold mb-4 text-neutral-800">Session Transcript</h2>
                <div className="h-96 bg-neutral-200 rounded-md p-4 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-neutral-700">{sessionText || "Your recorded audio will be transcribed here."}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



