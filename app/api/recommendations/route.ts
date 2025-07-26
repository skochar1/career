import { NextRequest, NextResponse } from 'next/server';
import { getJobRecommendations } from '../../../lib/job-matcher';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const recommendations = await getJobRecommendations(sessionId, limit);

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length
    });

  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', details: error.message },
      { status: 500 }
    );
  }
}