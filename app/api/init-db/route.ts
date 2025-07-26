import { NextResponse } from 'next/server';

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

let dbModule: any;
if (isProduction) {
  dbModule = require('../../../lib/database-postgres');
} else {
  dbModule = require('../../../lib/database');
}

export async function POST() {
  try {
    if (isProduction) {
      await dbModule.initializeDatabase();
    } else {
      // For SQLite, just get the database to initialize it
      const db = dbModule.getDatabase();
      console.log('SQLite database initialized');
    }
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (isProduction) {
      await dbModule.initializeDatabase();
    } else {
      // For SQLite, just get the database to initialize it
      const db = dbModule.getDatabase();
      console.log('SQLite database initialized');
    }
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error.message },
      { status: 500 }
    );
  }
}