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

    // Extract filters from search params
    const filters = {
      workType: {
        remote: searchParams.get('remote') === 'true',
        onsite: searchParams.get('onsite') === 'true',
        hybrid: searchParams.get('hybrid') === 'true',
      },
      employmentType: searchParams.get('employment_type')?.split(',').filter(Boolean),
      department: searchParams.get('department')?.split(',').filter(Boolean),
      seniorityLevel: searchParams.get('seniority_level'),
      location: searchParams.get('location'),
      search: searchParams.get('search'),
    };

    const recommendations = await getJobRecommendations(sessionId, limit, filters);

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