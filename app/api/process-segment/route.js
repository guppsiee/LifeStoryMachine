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

    await dbConnect();

    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json({ message: 'No audio file found' }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: new File([buffer], "audio.webm", { type: "audio/webm" }),
    });

    const transcript = transcription.text;

    let session = await SessionHistory.findOne({ userId });
    if (!session) {
      session = new SessionHistory({ userId, segments: [] });
    }

    session.segments.push(transcript);
    session.lastUpdated = new Date();
    await session.save();

    return NextResponse.json({ 
      sessionHistory: session,
      newTranscript: transcript 
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error processing audio:', error);
    return NextResponse.json({ message: 'Error processing audio' }, { status: 500 });
  }
}
