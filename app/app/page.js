"use client";

import RecordingComponent from '../components/RecordingComponent';
import { useState, useEffect, useCallback } from 'react';
import { LogOut, BookOpen, Edit, User, Settings, Info, Trash2, Save, Wand2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';

export default function AppPage() {
  const [sessionText, setSessionText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/session');
        if (response.ok) {
          const data = await response.json();
          setSessionText(data.sessionHistory.segments.join('\n'));
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
        router.push('/');
      }
    };
    fetchSession();
  }, [router]);

  const saveSessionText = useCallback((text) => {
    const debouncedSave = debounce(async (textToSave) => {
      setIsSaving(true);
      try {
        await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: textToSave }),
        });
      } catch (error) {
        console.error('Failed to save session:', error);
        toast.error('Failed to save changes.');
      } finally {
        setIsSaving(false);
      }
    }, 1000);
    debouncedSave(text);
  }, [setIsSaving]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setSessionText(newText);
    saveSessionText(newText);
  };

  const handleNewRecording = (newTranscript) => {
    // Append the new transcript to existing content
    setSessionText(prevText => {
      const updatedText = prevText ? `${prevText}\n${newTranscript}` : newTranscript;
      return updatedText;
    });
    // Don't trigger auto-save here since the recording API already saved the data
  };

  const handleLogout = async () => {
    const promise = fetch('/api/session', { method: 'DELETE' });
    toast.promise(promise, {
      loading: 'Logging out...',
      success: () => {
        router.push('/');
        return 'Logged out successfully.';
      },
      error: 'Failed to log out.'
    });
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved successfully!');
  }

  const wordCount = sessionText.trim().split(/\s+/).filter(Boolean).length;

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
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-neutral-800">Life Story Machine</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-lg font-medium text-blue-500 border-b-2 border-blue-500 pb-1">Recording Session</a>
              <a href="#" className="text-lg font-medium text-neutral-500 hover:text-neutral-700">Story Editing</a>
              <a href="#" className="text-lg font-medium text-neutral-500 hover:text-neutral-700">Profile</a>
              <a href="#" className="text-lg font-medium text-neutral-500 hover:text-neutral-700">Settings</a>
            </nav>
            <button onClick={handleLogout} className="flex items-center space-x-2 bg-neutral-200 px-4 py-2 rounded-lg hover:bg-neutral-300">
              <LogOut className="h-5 w-5 text-neutral-600" />
              <span className="font-semibold text-neutral-700">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl font-extrabold text-neutral-800">Record Your Story</h1>
            <p className="mt-2 text-lg text-neutral-500">Share your memories and experiences. We&apos;ll help you craft them into a beautiful story.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md border border-neutral-200">
            <RecordingComponent onNewRecording={handleNewRecording} />
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md border border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-neutral-800">Your Story Transcript</h2>
              <div className="flex items-center space-x-4 text-neutral-500">
                <button onClick={() => setSessionText('')} className="flex items-center space-x-1 hover:text-neutral-700">
                  <Trash2 className="h-4 w-4"/>
                  <span>Clear</span>
                </button>
                <span className="text-sm">{wordCount} words</span>
                {isSaving && <div className="text-sm text-neutral-500">Saving...</div>}
              </div>
            </div>
            <div className="h-64 bg-neutral-100 rounded-lg p-4 relative">
              <textarea
                className="w-full h-full bg-transparent border-none focus:ring-0 resize-none text-neutral-700"
                value={sessionText}
                onChange={handleTextChange}
                placeholder="Your spoken words will appear here. You can edit and refine your story as needed..."
              />
              <span className="absolute bottom-4 right-4 text-xs text-neutral-400">Click to edit your transcript</span>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <button onClick={handleGenerateStory} disabled={isGenerating} className="flex items-center space-x-2 bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-600 transition disabled:opacity-50">
              <Wand2 className="h-5 w-5" />
              <span>{isGenerating ? 'Generating...' : 'Generate Story'}</span>
            </button>
            <button onClick={handleSaveDraft} className="flex items-center space-x-2 bg-neutral-200 text-neutral-700 px-8 py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-neutral-300 transition">
              <Save className="h-5 w-5" />
              <span>Save Draft</span>
            </button>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-neutral-800">How it works</h3>
                <div className="mt-4 space-y-3 text-neutral-700">
                    <p><span className="font-bold">1.</span> Click &quot;Start Recording&quot; and speak naturally about your memories and experiences</p>
                    <p><span className="font-bold">2.</span> Your words are transcribed in real-time. You can pause and resume recording at any time.</p>
                    <p><span className="font-bold">3.</span> Once you&apos;re done, you can edit the transcript to make any corrections or additions.</p>
                    <p><span className="font-bold">4.</span> Click &quot;Generate Story&quot; and we&apos;ll transform your transcript into a beautifully written story.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



