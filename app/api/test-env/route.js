import { NextResponse } from 'next/server';

export async function GET(request) {
  const resendKey = process.env.RESEND_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  return NextResponse.json({
    resend: resendKey ? 'loaded' : 'not found',
    openai: openaiKey ? 'loaded' : 'not found',
  });
} 