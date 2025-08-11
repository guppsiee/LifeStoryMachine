import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/mongodb';
import SessionHistory from '../../../models/sessionHistory';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log('🔊 [process-segment] Processing audio for user:', userId);

    await dbConnect();

    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json({ message: 'No audio file found' }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    console.log('🔊 [process-segment] Audio buffer size:', buffer.length);
    
    let transcript;
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to simulated transcript if no API key
      transcript = `Simulated transcript ${Date.now()}`;
      console.log('🔊 [process-segment] No OpenAI key, using simulated transcript:', transcript);
    } else {
      // Use actual OpenAI transcription
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      const transcription = await openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: new File([buffer], "audio.webm", { type: "audio/webm" }),
      });
      transcript = transcription.text;
      console.log('🔊 [process-segment] OpenAI transcript:', transcript);
    }

    let session = await SessionHistory.findOne({ userId });
    console.log('🔊 [process-segment] Current session before update:', session);
    
    if (!session) {
      session = new SessionHistory({ userId, segments: [] });
      console.log('🔊 [process-segment] Created new session');
    }

    console.log('🔊 [process-segment] Segments before push:', session.segments);
    session.segments.push(transcript);
    console.log('🔊 [process-segment] Segments after push:', session.segments);
    
    session.lastUpdated = new Date();
    await session.save();
    console.log('🔊 [process-segment] Session saved successfully');

    const response = { 
      sessionHistory: session,
      newTranscript: transcript 
    };
    console.log('🔊 [process-segment] Returning response:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error processing audio:', error);
    return NextResponse.json({ message: 'Error processing audio' }, { status: 500 });
  }
}
