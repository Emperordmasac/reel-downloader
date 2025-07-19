import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const downloadUrl = searchParams.get('url');
    const filename = searchParams.get('filename');

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Download URL is required' },
        { status: 400 }
      );
    }

    // Fetch the video content
    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch video content' },
        { status: 500 }
      );
    }

    // Get the content type from the original response
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');

    // Create response headers for download
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename || 'video.mp4'}"`,
      'Cache-Control': 'no-cache',
    });

    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    // Stream the video content
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Stream error:', error);
    return NextResponse.json(
      { error: 'Failed to stream video content' },
      { status: 500 }
    );
  }
}
