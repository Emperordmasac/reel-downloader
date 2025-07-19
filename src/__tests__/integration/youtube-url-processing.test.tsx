import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { POST } from '@/app/api/download/route';
import { NextRequest } from 'next/server';
import ReelDownloader from '@/components/reel-downloader';

// Mock fetch for component tests
global.fetch = jest.fn();

// Helper function to create mock request
function createMockRequest(body: any): NextRequest {
  const request = {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
  return request;
}

describe('YouTube URL Processing Integration Tests', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('End-to-End YouTube URL Processing', () => {
    const testCases = [
      {
        name: 'standard YouTube URL',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        expectedVideoId: 'dQw4w9WgXcQ'
      },
      {
        name: 'YouTube Shorts URL',
        url: 'https://youtube.com/shorts/Xqtf3xYk5vc?si=abc',
        expectedVideoId: 'Xqtf3xYk5vc'
      },
      {
        name: 'youtu.be short URL',
        url: 'https://youtu.be/dQw4w9WgXcQ?t=43',
        expectedVideoId: 'dQw4w9WgXcQ'
      },
      {
        name: 'mobile YouTube URL',
        url: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=Rick',
        expectedVideoId: 'dQw4w9WgXcQ'
      }
    ];

    testCases.forEach(({ name, url, expectedVideoId }) => {
      test(`should process ${name} successfully through API`, async () => {
        const request = createMockRequest({
          url: url,
          platform: 'YouTube'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.videoId).toBe(expectedVideoId);
        expect(data.title).toBe(`YouTube Video ${expectedVideoId}`);
        expect(data.filename).toBe(`youtube_video_${expectedVideoId}.mp4`);
        expect(data.message).toContain('YouTube video processing is currently under development');
      });

      test(`should process ${name} successfully through UI`, async () => {
        // Mock successful API response
        const mockResponse = {
          videoId: expectedVideoId,
          title: `YouTube Video ${expectedVideoId}`,
          duration: 'Unknown',
          quality: 'Best Available',
          downloadUrl: '#',
          filename: `youtube_video_${expectedVideoId}.mp4`,
          message: 'YouTube video processing is currently under development. Please check back later for full functionality.'
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        render(<ReelDownloader />);

        // Enter URL
        const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
        await userEvent.type(input, url);

        // Verify platform detection
        expect(screen.getByText('Platform detected: YouTube')).toBeInTheDocument();

        // Verify button is enabled
        const button = screen.getByRole('button', { name: /Download Video/ });
        expect(button).not.toBeDisabled();

        // Click download
        await userEvent.click(button);

        // Verify API call
        await waitFor(() => {
          expect(fetch).toHaveBeenCalledWith('/api/download', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, platform: 'YouTube' }),
          });
        });

        // Verify UI updates
        await waitFor(() => {
          expect(screen.getByText(/YouTube video processing is currently under development/)).toBeInTheDocument();
          expect(screen.getByText('Video Information')).toBeInTheDocument();
          expect(screen.getByText(new RegExp(`Title:.*YouTube Video ${expectedVideoId}`))).toBeInTheDocument();
        });
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle invalid non-YouTube URL through complete workflow', async () => {
      const invalidUrl = 'https://example.com/not-a-video';

      // Test API directly
      const request = createMockRequest({
        url: invalidUrl,
        platform: 'YouTube'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid YouTube URL format. Please provide a valid YouTube video URL.');

      // Test UI behavior - should detect as Unknown platform and disable button
      render(<ReelDownloader />);

      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, invalidUrl);

      expect(screen.getByText('Platform detected: Unknown')).toBeInTheDocument();
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      expect(button).toBeDisabled();
    });

    test('should handle malformed YouTube URL through complete workflow', async () => {
      const malformedUrl = 'https://youtube.com/watch';

      // Test API directly
      const request = createMockRequest({
        url: malformedUrl,
        platform: 'YouTube'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid YouTube URL format. Please provide a valid YouTube video URL.');

      // Test UI - should detect as YouTube but when clicked, should show error
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid YouTube URL format. Please provide a valid YouTube video URL.' }),
      });

      render(<ReelDownloader />);

      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, malformedUrl);

      expect(screen.getByText('Platform detected: YouTube')).toBeInTheDocument();

      const button = screen.getByRole('button', { name: /Download Video/ });
      expect(button).not.toBeDisabled();

      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Invalid YouTube URL format. Please provide a valid YouTube video URL.')).toBeInTheDocument();
      });
    });

    test('should handle API server error through UI', async () => {
      const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Server error'));

      render(<ReelDownloader />);

      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, validUrl);

      const button = screen.getByRole('button', { name: /Download Video/ });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });
  });

  describe('Platform Detection and Validation Consistency', () => {
    test('should have consistent behavior between API and UI for all platforms', async () => {
      const testUrls = [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', platform: 'YouTube', shouldWork: true },
        { url: 'https://youtube.com/shorts/Xqtf3xYk5vc?si=abc', platform: 'YouTube', shouldWork: true },
        { url: 'https://youtu.be/dQw4w9WgXcQ?t=43', platform: 'YouTube', shouldWork: true },
        { url: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=Rick', platform: 'YouTube', shouldWork: true },
        { url: 'https://instagram.com/reel/example', platform: 'Instagram', shouldWork: false },
        { url: 'https://facebook.com/video/example', platform: 'Facebook', shouldWork: false },
        { url: 'https://example.com/not-a-video', platform: 'Unknown', shouldWork: false }
      ];

      for (const { url, platform, shouldWork } of testUrls) {
        // Test UI platform detection
        render(<ReelDownloader />);
        
        const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
        await userEvent.clear(input);
        await userEvent.type(input, url);

        expect(screen.getByText(`Platform detected: ${platform}`)).toBeInTheDocument();

        const button = screen.getByRole('button', { name: /Download Video/ });
        
        if (shouldWork) {
          expect(button).not.toBeDisabled();
        } else if (platform !== 'Unknown') {
          // Instagram/Facebook should be enabled in UI but fail at API level
          expect(button).not.toBeDisabled();
        } else {
          // Unknown platform should disable button
          expect(button).toBeDisabled();
        }

        // Cleanup for next iteration
        screen.unmount();
      }
    });
  });

  describe('Loading State Integration', () => {
    test('should show loading state during API call and hide after completion', async () => {
      const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      // Mock delayed response
      (fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            videoId: 'dQw4w9WgXcQ',
            title: 'YouTube Video dQw4w9WgXcQ',
            message: 'Success'
          }),
        }), 200))
      );

      render(<ReelDownloader />);

      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, validUrl);

      const button = screen.getByRole('button', { name: /Download Video/ });
      await userEvent.click(button);

      // Should show loading immediately
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(input).toBeDisabled();

      // Should hide loading after completion
      await waitFor(() => {
        expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(button).not.toBeDisabled();
      expect(input).not.toBeDisabled();
    });
  });
});
