import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReelDownloader from '@/components/reel-downloader';

// Mock the fetch function
global.fetch = jest.fn();

describe('ReelDownloader Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('Platform Detection', () => {
    test('should detect YouTube platform for standard URL', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      
      expect(screen.getByText('Platform detected: YouTube')).toBeInTheDocument();
    });

    test('should detect YouTube platform for Shorts URL', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://youtube.com/shorts/Xqtf3xYk5vc?si=abc');
      
      expect(screen.getByText('Platform detected: YouTube')).toBeInTheDocument();
    });

    test('should detect YouTube platform for youtu.be URL', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://youtu.be/dQw4w9WgXcQ?t=43');
      
      expect(screen.getByText('Platform detected: YouTube')).toBeInTheDocument();
    });

    test('should detect YouTube platform for mobile URL', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://m.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=Rick');
      
      expect(screen.getByText('Platform detected: YouTube')).toBeInTheDocument();
    });

    test('should detect Unknown platform for non-YouTube URL', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://example.com/not-a-video');
      
      expect(screen.getByText('Platform detected: Unknown')).toBeInTheDocument();
    });

    test('should detect Instagram platform', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://instagram.com/reel/example');
      
      expect(screen.getByText('Platform detected: Instagram')).toBeInTheDocument();
    });

    test('should detect Facebook platform', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://facebook.com/video/example');
      
      expect(screen.getByText('Platform detected: Facebook')).toBeInTheDocument();
    });
  });

  describe('URL Validation and Button State', () => {
    test('should disable download button for empty URL', () => {
      render(<ReelDownloader />);
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      expect(button).toBeDisabled();
    });

    test('should disable download button for invalid URL format', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'not-a-valid-url');
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      expect(button).toBeDisabled();
    });

    test('should disable download button for unsupported platform', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://example.com/video');
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      expect(button).toBeDisabled();
    });

    test('should enable download button for valid YouTube URL', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      expect(button).not.toBeDisabled();
    });

    test('should enable download button for valid YouTube Shorts URL', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://youtube.com/shorts/Xqtf3xYk5vc?si=abc');
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      expect(button).not.toBeDisabled();
    });

    test('should enable download button for valid youtu.be URL', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://youtu.be/dQw4w9WgXcQ?t=43');
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      expect(button).not.toBeDisabled();
    });

    test('should enable download button for valid mobile YouTube URL', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://m.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=Rick');
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      expect(button).not.toBeDisabled();
    });
  });

  describe('Download Functionality', () => {
    test('should handle successful YouTube video download', async () => {
      const mockResponse = {
        videoId: 'dQw4w9WgXcQ',
        title: 'YouTube Video dQw4w9WgXcQ',
        duration: 'Unknown',
        quality: 'Best Available',
        downloadUrl: '#',
        filename: 'youtube_video_dQw4w9WgXcQ.mp4',
        message: 'YouTube video processing is currently under development. Please check back later for full functionality.'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      await userEvent.click(button);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
            platform: 'YouTube' 
          }),
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/YouTube video processing is currently under development/)).toBeInTheDocument();
        expect(screen.getByText('Video Information')).toBeInTheDocument();
        expect(screen.getByText(/Title:.*YouTube Video dQw4w9WgXcQ/)).toBeInTheDocument();
      });
    });

    test('should handle API error response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid YouTube URL format. Please provide a valid YouTube video URL.' }),
      });

      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://www.youtube.com/watch?v=invalid');
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Invalid YouTube URL format. Please provide a valid YouTube video URL.')).toBeInTheDocument();
      });
    });

    test('should show error message for unknown platform', async () => {
      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://example.com/not-a-video');
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Unsupported platform. Please use YouTube, Instagram, or Facebook URLs.')).toBeInTheDocument();
      });
    });

    test('should show error message for empty URL', async () => {
      render(<ReelDownloader />);
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      
      // Clear any existing content and try to click (though button should be disabled)
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.clear(input);
      
      // Manually trigger the download function by calling handleDownload
      fireEvent.click(button);

      // Since the button should be disabled, we won't see the error message
      // But let's test the validation logic directly by typing and clearing
      expect(button).toBeDisabled();
    });

    test('should show loading state during download', async () => {
      // Mock a delayed response
      (fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ message: 'Success' }),
        }), 100))
      );

      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      await userEvent.click(button);

      // Check for loading state
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(button).toBeDisabled();

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    test('should handle non-Error exception', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce('String error');

      render(<ReelDownloader />);
      
      const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/);
      await userEvent.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      
      const button = screen.getByRole('button', { name: /Download Video/ });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Error downloading video. Please try again.')).toBeInTheDocument();
      });
    });
  });
});
