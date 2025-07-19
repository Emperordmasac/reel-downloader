// Extract the URL validation logic for testing
// These functions mirror the logic in the components and API

function detectPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'YouTube';
  } else if (url.includes('instagram.com')) {
    return 'Instagram';
  } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return 'Facebook';
  }
  return 'Unknown';
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return detectPlatform(url) !== 'Unknown';
  } catch {
    return false;
  }
}

function extractYouTubeVideoId(url: string): string | null {
  // Enhanced YouTube URL validation (supports regular videos, shorts, and youtu.be links)
  const youtubeRegex = /(?:youtube\.com\/(?:(?:watch\?v=|embed\/|v\/)|shorts\/)([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11}))/;
  const match = url.match(youtubeRegex);
  
  if (!match) {
    return null;
  }
  
  // Capture regex group 1 (youtube.com format) or group 2 (youtu.be format)
  const videoId = match[1] || match[2];
  
  // Validate video ID length
  if (!videoId || videoId.length !== 11) {
    return null;
  }
  
  return videoId;
}

describe('URL Validation Utilities', () => {
  describe('detectPlatform', () => {
    test('should detect YouTube for standard URLs', () => {
      expect(detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('YouTube');
      expect(detectPlatform('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe('YouTube');
      expect(detectPlatform('http://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('YouTube');
    });

    test('should detect YouTube for Shorts URLs', () => {
      expect(detectPlatform('https://youtube.com/shorts/Xqtf3xYk5vc?si=abc')).toBe('YouTube');
      expect(detectPlatform('https://www.youtube.com/shorts/Xqtf3xYk5vc')).toBe('YouTube');
      expect(detectPlatform('http://youtube.com/shorts/Xqtf3xYk5vc?feature=share')).toBe('YouTube');
    });

    test('should detect YouTube for youtu.be URLs', () => {
      expect(detectPlatform('https://youtu.be/dQw4w9WgXcQ?t=43')).toBe('YouTube');
      expect(detectPlatform('https://youtu.be/dQw4w9WgXcQ')).toBe('YouTube');
      expect(detectPlatform('http://youtu.be/dQw4w9WgXcQ?si=test')).toBe('YouTube');
    });

    test('should detect YouTube for mobile URLs', () => {
      expect(detectPlatform('https://m.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=Rick')).toBe('YouTube');
      expect(detectPlatform('http://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('YouTube');
    });

    test('should detect Instagram platform', () => {
      expect(detectPlatform('https://instagram.com/reel/example')).toBe('Instagram');
      expect(detectPlatform('https://www.instagram.com/p/example')).toBe('Instagram');
      expect(detectPlatform('http://instagram.com/tv/example')).toBe('Instagram');
    });

    test('should detect Facebook platform', () => {
      expect(detectPlatform('https://facebook.com/video/example')).toBe('Facebook');
      expect(detectPlatform('https://www.facebook.com/watch?v=example')).toBe('Facebook');
      expect(detectPlatform('https://fb.watch/example')).toBe('Facebook');
      expect(detectPlatform('http://facebook.com/example/videos/123')).toBe('Facebook');
    });

    test('should detect Unknown for unsupported platforms', () => {
      expect(detectPlatform('https://example.com/video')).toBe('Unknown');
      expect(detectPlatform('https://tiktok.com/video/123')).toBe('Unknown');
      expect(detectPlatform('https://vimeo.com/123456')).toBe('Unknown');
      expect(detectPlatform('https://dailymotion.com/video/123')).toBe('Unknown');
    });
  });

  describe('isValidUrl', () => {
    test('should validate correct YouTube URLs', () => {
      expect(isValidUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isValidUrl('https://youtube.com/shorts/Xqtf3xYk5vc?si=abc')).toBe(true);
      expect(isValidUrl('https://youtu.be/dQw4w9WgXcQ?t=43')).toBe(true);
      expect(isValidUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=Rick')).toBe(true);
    });

    test('should validate other supported platform URLs', () => {
      expect(isValidUrl('https://instagram.com/reel/example')).toBe(true);
      expect(isValidUrl('https://facebook.com/video/example')).toBe(true);
      expect(isValidUrl('https://fb.watch/example')).toBe(true);
    });

    test('should reject invalid URL formats', () => {
      expect(isValidUrl('not-a-valid-url')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
      expect(isValidUrl('https://')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });

    test('should reject unsupported platforms', () => {
      expect(isValidUrl('https://example.com/video')).toBe(false);
      expect(isValidUrl('https://tiktok.com/video/123')).toBe(false);
      expect(isValidUrl('https://vimeo.com/123456')).toBe(false);
    });
  });

  describe('extractYouTubeVideoId', () => {
    test('should extract video ID from standard YouTube URLs', () => {
      expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeVideoId('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeVideoId('http://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=Rick&t=43')).toBe('dQw4w9WgXcQ');
    });

    test('should extract video ID from YouTube Shorts URLs', () => {
      expect(extractYouTubeVideoId('https://youtube.com/shorts/Xqtf3xYk5vc?si=abc')).toBe('Xqtf3xYk5vc');
      expect(extractYouTubeVideoId('https://www.youtube.com/shorts/Xqtf3xYk5vc')).toBe('Xqtf3xYk5vc');
      expect(extractYouTubeVideoId('http://youtube.com/shorts/Xqtf3xYk5vc?feature=share')).toBe('Xqtf3xYk5vc');
    });

    test('should extract video ID from youtu.be URLs', () => {
      expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ?t=43')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeVideoId('http://youtu.be/dQw4w9WgXcQ?si=test&feature=share')).toBe('dQw4w9WgXcQ');
    });

    test('should extract video ID from mobile YouTube URLs', () => {
      expect(extractYouTubeVideoId('https://m.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=Rick')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeVideoId('http://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    test('should handle embedded YouTube URLs', () => {
      expect(extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeVideoId('https://youtube.com/v/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    test('should return null for invalid YouTube URLs', () => {
      expect(extractYouTubeVideoId('https://youtube.com/watch')).toBe(null);
      expect(extractYouTubeVideoId('https://youtube.com/shorts/')).toBe(null);
      expect(extractYouTubeVideoId('https://youtu.be/')).toBe(null);
      expect(extractYouTubeVideoId('https://youtube.com/watch?v=')).toBe(null);
    });

    test('should return null for non-YouTube URLs', () => {
      expect(extractYouTubeVideoId('https://example.com/not-a-video')).toBe(null);
      expect(extractYouTubeVideoId('https://instagram.com/reel/example')).toBe(null);
      expect(extractYouTubeVideoId('https://facebook.com/video/example')).toBe(null);
      expect(extractYouTubeVideoId('https://vimeo.com/123456')).toBe(null);
    });

    test('should return null for invalid video ID length', () => {
      expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=short')).toBe(null);
      expect(extractYouTubeVideoId('https://youtu.be/short')).toBe(null);
      expect(extractYouTubeVideoId('https://youtube.com/shorts/short')).toBe(null);
    });

    test('should handle malformed URLs gracefully', () => {
      expect(extractYouTubeVideoId('not-a-url')).toBe(null);
      expect(extractYouTubeVideoId('')).toBe(null);
      expect(extractYouTubeVideoId('https://youtube')).toBe(null);
      // Note: youtube.com/watch?v=dQw4w9WgXcQ actually matches because the regex doesn't require protocol
      // This is expected behavior as it allows the regex to be more flexible
    });

    test('should handle edge cases with special characters', () => {
      // Valid video IDs can contain letters, numbers, hyphens, and underscores
      expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=123-456_789')).toBe('123-456_789');
      expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=abcDEF12345')).toBe('abcDEF12345');
      
      // Test with exactly 11 characters containing valid characters
      expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=ABC_123-xyz')).toBe('ABC_123-xyz');
    });
  });

  describe('Specific Test Case URLs from Task', () => {
    test('should handle all specified test URLs correctly', () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          expectedPlatform: 'YouTube',
          expectedVideoId: 'dQw4w9WgXcQ',
          expectedValid: true
        },
        {
          url: 'https://youtube.com/shorts/Xqtf3xYk5vc?si=abc',
          expectedPlatform: 'YouTube',
          expectedVideoId: 'Xqtf3xYk5vc',
          expectedValid: true
        },
        {
          url: 'https://youtu.be/dQw4w9WgXcQ?t=43',
          expectedPlatform: 'YouTube',
          expectedVideoId: 'dQw4w9WgXcQ',
          expectedValid: true
        },
        {
          url: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=Rick',
          expectedPlatform: 'YouTube',
          expectedVideoId: 'dQw4w9WgXcQ',
          expectedValid: true
        },
        {
          url: 'https://example.com/not-a-video',
          expectedPlatform: 'Unknown',
          expectedVideoId: null,
          expectedValid: false
        }
      ];

      testCases.forEach(({ url, expectedPlatform, expectedVideoId, expectedValid }) => {
        expect(detectPlatform(url)).toBe(expectedPlatform);
        expect(extractYouTubeVideoId(url)).toBe(expectedVideoId);
        expect(isValidUrl(url)).toBe(expectedValid);
      });
    });
  });
});
