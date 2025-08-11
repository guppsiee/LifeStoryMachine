import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/mongodb';
import SessionHistory from '../../../models/sessionHistory';

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    await dbConnect();

    let session = await SessionHistory.findOne({ userId });
    if (!session) {
      // If no session, create one
      session = new SessionHistory({ userId, segments: [] });
      await session.save();
    }

    return NextResponse.json({ sessionHistory: session });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching session:', error);
    return NextResponse.json({ message: 'Error fetching session' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { text } = await req.json();

    await dbConnect();

    // Get current session to preserve the structure
    let session = await SessionHistory.findOne({ userId });
    if (!session) {
      session = new SessionHistory({ userId, segments: [] });
    }

    // Split the text and filter out empty segments
    const segments = text.split('\n').filter(segment => segment.trim() !== '');

    // Update the session with the new segments
    session.segments = segments;
    session.lastUpdated = new Date();
    await session.save();

    return NextResponse.json({ message: 'Session updated successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating session:', error);
    return NextResponse.json({ message: 'Error updating session' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    await dbConnect();

    await SessionHistory.deleteOne({ userId });

    const response = NextResponse.json({ message: 'Session deleted successfully' });
    response.cookies.set('token', '', { httpOnly: true, secure: process.env.NODE_ENV !== 'development', sameSite: 'strict', path: '/', expires: new Date(0) });

    return response;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting session:', error);
    return NextResponse.json({ message: 'Error deleting session' }, { status: 500 });
  }
}
