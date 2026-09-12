import clientPromise from '@/lib/mongodb.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // clientPromise is the connection helper you just created
    const client = await clientPromise;
    const db = client.db("SlotSmart"); // Specify your database name

    // Try to find one user from your 'users' collection
    const user = await db.collection("students_dataset").findOne({});

    return NextResponse.json({
      status: 200,
      message: "Successfully connected to MongoDB!",
      user: user
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      status: 500,
      message: `Failed to connect to database: ${e.message}`
    });
  }
}
