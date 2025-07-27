import { NextRequest, NextResponse } from 'next/server';
import { matchCache } from '../../../lib/match-cache';

export async function GET(request: NextRequest) {
  try {
    const stats = matchCache.getStats();
    
    const performanceMetrics = {
      ...stats,
      timestamp: new Date().toISOString(),
      cacheEfficiency: {
        description: "Higher numbers indicate better performance",
        activeSessions: stats.activeSessions,
        totalCachedMatches: stats.totalCachedMatches,
        avgMatchesPerSession: stats.activeSessions > 0 
          ? Math.round(stats.totalCachedMatches / stats.activeSessions) 
          : 0,
        embeddingsCacheSize: stats.embeddingsCacheSize
      },
      tips: [
        "Cached matches avoid expensive AI API calls",
        "Embeddings cache reduces computation time",
        "Session cache persists across filter changes"
      ]
    };

    return NextResponse.json({
      success: true,
      performance: performanceMetrics
    });
  } catch (error) {
    console.error('Error getting performance stats:', error);
    return NextResponse.json(
      { error: 'Failed to get performance stats' },
      { status: 500 }
    );
  }
}