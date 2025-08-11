import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/mongodb';
import SessionHistory from '../../../models/sessionHistory';

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log('🧹 [cleanup-session] Cleaning up duplicates for user:', userId);

    await dbConnect();

    let session = await SessionHistory.findOne({ userId });
    if (!session) {
      return NextResponse.json({ message: 'No session found' }, { status: 404 });
    }

    console.log('🧹 [cleanup-session] Original segments:', session.segments);

    // Remove duplicates by converting to Set and back to Array
    const uniqueSegments = [...new Set(session.segments.filter(segment => segment.trim() !== ''))];
    console.log('🧹 [cleanup-session] Unique segments:', uniqueSegments);

    session.segments = uniqueSegments;
    session.lastUpdated = new Date();
    await session.save();

    console.log('🧹 [cleanup-session] Cleanup completed');

    return NextResponse.json({ 
      message: 'Session cleaned up successfully',
      originalCount: session.segments.length,
      uniqueCount: uniqueSegments.length,
      removedDuplicates: session.segments.length - uniqueSegments.length
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error cleaning up session:', error);
    return NextResponse.json({ message: 'Error cleaning up session' }, { status: 500 });
  }
}
