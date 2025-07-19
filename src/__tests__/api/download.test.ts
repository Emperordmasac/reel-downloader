import { POST } from '@/app/api/download/route';
import { NextRequest, NextResponse } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: jest.fn().mockResolvedValue(data),
      status: init?.status || 200,
    })),
  },
}));

// Mock NextRequest for testing
function createMockRequest(body: any): NextRequest {
  const request = {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
  return request;
}

describe('/api/download POST endpoint', () => {
  describe('YouTube URL validation and processing', () => {
    test('should successfully process standard YouTube URL', async () => {
      const request = createMockRequest({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'YouTube'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.videoId).toBe('dQw4w9WgXcQ');
      expect(data.title).toBe('YouTube Video dQw4w9WgXcQ');
      expect(data.filename).toBe('youtube_video_dQw4w9WgXcQ.mp4');
      expect(data.message).toContain('YouTube video processing is currently under development');
    });

    test('should successfully process YouTube Shorts URL', async () => {
      const request = createMockRequest({
        url: 'https://youtube.com/shorts/Xqtf3xYk5vc?si=abc',
        platform: 'YouTube'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.videoId).toBe('Xqtf3xYk5vc');
      expect(data.title).toBe('YouTube Video Xqtf3xYk5vc');
      expect(data.filename).toBe('youtube_video_Xqtf3xYk5vc.mp4');
    });

    test('should successfully process youtu.be short URL', async () => {
      const request = createMockRequest({
        url: 'https://youtu.be/dQw4w9WgXcQ?t=43',
        platform: 'YouTube'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.videoId).toBe('dQw4w9WgXcQ');
      expect(data.title).toBe('YouTube Video dQw4w9WgXcQ');
      expect(data.filename).toBe('youtube_video_dQw4w9WgXcQ.mp4');
    });

    test('should successfully process mobile YouTube URL', async () => {
      const request = createMockRequest({
        url: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=Rick',
        platform: 'YouTube'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.videoId).toBe('dQw4w9WgXcQ');
      expect(data.title).toBe('YouTube Video dQw4w9WgXcQ');
      expect(data.filename).toBe('youtube_video_dQw4w9WgXcQ.mp4');
    });

    test('should reject invalid non-YouTube URL', async () => {
      const request = createMockRequest({
        url: 'https://example.com/not-a-video',
        platform: 'YouTube'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid YouTube URL format. Please provide a valid YouTube video URL.');
    });

    test('should reject malformed YouTube URL', async () => {
      const request = createMockRequest({
        url: 'https://youtube.com/watch',
        platform: 'YouTube'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid YouTube URL format. Please provide a valid YouTube video URL.');
    });

    test('should reject YouTube URL with invalid video ID length', async () => {
      const request = createMockRequest({
        url: 'https://www.youtube.com/watch?v=short',
        platform: 'YouTube'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unable to extract valid video ID from YouTube URL');
    });
  });

  describe('General URL validation', () => {
    test('should reject missing URL', async () => {
      const request = createMockRequest({
        platform: 'YouTube'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('URL is required');
    });

    test('should reject empty URL', async () => {
      const request = createMockRequest({
        url: '',
        platform: 'YouTube'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('URL is required');
    });

    test('should reject invalid URL format', async () => {
      const request = createMockRequest({
        url: 'not-a-valid-url',
        platform: 'YouTube'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid URL format');
    });
  });

  describe('Platform support', () => {
    test('should handle unsupported platform', async () => {
      const request = createMockRequest({
        url: 'https://example.com/video',
        platform: 'UnsupportedPlatform'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unsupported platform');
    });

    test('should handle Instagram platform (not implemented)', async () => {
      const request = createMockRequest({
        url: 'https://instagram.com/reel/example',
        platform: 'Instagram'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(501);
      expect(data.error).toBe('Instagram downloads require additional setup. Please check the documentation.');
    });

    test('should handle Facebook platform (not implemented)', async () => {
      const request = createMockRequest({
        url: 'https://facebook.com/video/example',
        platform: 'Facebook'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(501);
      expect(data.error).toBe('Facebook downloads require additional setup. Please check the documentation.');
    });
  });

  describe('Error handling', () => {
    test('should handle malformed JSON request', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
