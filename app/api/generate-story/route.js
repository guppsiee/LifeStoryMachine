import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/mongodb';
import SessionHistory from '../../../models/sessionHistory';
import User from '../../../models/user';
import { OpenAI } from 'openai';
import { Resend } from 'resend';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    await dbConnect();

    const session = await SessionHistory.findOne({ userId });
    if (!session || session.segments.length === 0) {
      return NextResponse.json({ message: 'No session history found' }, { status: 404 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const combinedText = session.segments.join('\\n\\n');

    const storyResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a master storyteller. Based on the following user-provided snippets, weave a beautiful and compelling life story. The story should be well-structured, engaging, and reflect the tone and content of the snippets.' },
        { role: 'user', content: combinedText },
      ],
    });

    const story = storyResponse.choices[0].message.content;

    await resend.emails.send({
      from: 'Life Story Machine <onboarding@resend.dev>',
      to: user.email,
      subject: 'Your Life Story',
      html: `<p>${story.replace(/\\n/g, '<br>')}</p>`,
    });

    await SessionHistory.deleteOne({ userId });

    return NextResponse.json({ message: 'Story generated and sent successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error generating story:', error);
    return NextResponse.json({ message: 'Error generating story' }, { status: 500 });
  }
}
