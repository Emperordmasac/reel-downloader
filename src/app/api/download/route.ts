import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, platform } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Handle YouTube videos
    if (platform === 'YouTube') {
      // Enhanced YouTube URL validation (supports regular videos, shorts, and youtu.be links)
      // Regex groups: 1 = youtube.com video ID, 2 = youtu.be video ID
      // Use word boundaries (\b) to ensure exact 11-character match and not longer strings
      const youtubeRegex = /(?:youtube\.com\/(?:(?:watch\?v=|embed\/|v\/)|shorts\/)([a-zA-Z0-9_-]{11})(?:\b|&|$)|youtu\.be\/([a-zA-Z0-9_-]{11})(?:\b|\?|$))/;
      const match = url.match(youtubeRegex);
      
      // Handle edge case: no regex match (malformed YouTube URL)
      if (!match) {
        return NextResponse.json(
          { error: 'Invalid YouTube URL format. Please provide a valid YouTube video URL.' },
          { status: 400 }
        );
      }

      // Capture regex group 1 (youtube.com format) or group 2 (youtu.be format) for downstream use
      const videoId = match[1] || match[2];
      
      // Handle edge case: missing video ID (this shouldn't happen with our regex, but safety check)
      if (!videoId || videoId.length !== 11) {
        return NextResponse.json(
          { error: 'Unable to extract valid video ID from YouTube URL' },
          { status: 400 }
        );
      }
      
      // For now, return mock data since ytdl-core can be unreliable
      // In production, you would implement proper video extraction here
      return NextResponse.json({
        title: `YouTube Video ${videoId}`,
        duration: 'Unknown',
        quality: 'Best Available',
        videoId: videoId,
        downloadUrl: `#`, // This would be the actual download URL
        filename: `youtube_video_${videoId}.mp4`,
        message: 'YouTube video processing is currently under development. Please check back later for full functionality.'
      });
    }

    // Handle Instagram (basic implementation - Instagram requires more complex handling)
    if (platform === 'Instagram') {
      // Instagram videos require more complex scraping due to their API restrictions
      // This is a placeholder implementation
      return NextResponse.json(
        { error: 'Instagram downloads require additional setup. Please check the documentation.' },
        { status: 501 }
      );
    }

    // Handle Facebook (basic implementation - Facebook requires more complex handling)
    if (platform === 'Facebook') {
      // Facebook videos require more complex scraping due to their API restrictions
      // This is a placeholder implementation
      return NextResponse.json(
        { error: 'Facebook downloads require additional setup. Please check the documentation.' },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: 'Unsupported platform' },
      { status: 400 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
