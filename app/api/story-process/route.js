import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Resend } from 'resend';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get('audio');

    if (!audioBlob) {
      return NextResponse.json({ message: 'Audio data not found' }, { status: 400 });
    }

    console.log('Received audio data. Size:', audioBlob.size, 'Type:', audioBlob.type);

    const audioFile = new File([audioBlob], "audio.webm", { type: audioBlob.type });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });

    console.log('Transcription:', transcription.text);

    const prompt = `Based on the following transcript, write a short, compelling life story. The story should be engaging, well-structured, and capture the essence of the user's experience. Transcript: "${transcription.text}"`;

    const storyResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const story = storyResponse.choices[0].message.content;
    console.log('Generated Story:', story);

    // TODO: Replace with the user's actual email from the session token once JWT authentication is implemented.
    const userEmail = 'divvygopal@gmail.com'; 

    await resend.emails.send({
      from: 'Life Story Machine <onboarding@resend.dev>',
      to: userEmail,
      subject: 'Your Life Story',
      html: `<p>${story.replace(/\n/g, "<br>")}</p>`,
    });

    return NextResponse.json({ message: 'Your story has been generated and sent to your email.' }, { status: 200 });
  } catch (error) {
    console.error('Error processing story:', error);
    return NextResponse.json({ message: 'An error occurred while processing your story.' }, { status: 500 });
  }
}
