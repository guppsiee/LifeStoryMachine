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

    const session = await SessionHistory.findOne({ userId });
    if (!session) {
      return NextResponse.json({ sessionHistory: { segments: [] } });
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

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting session:', error);
    return NextResponse.json({ message: 'Error deleting session' }, { status: 500 });
  }
}
