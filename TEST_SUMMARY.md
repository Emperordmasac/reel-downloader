# YouTube URL Processing Test Suite

## Overview
This test suite provides comprehensive coverage for YouTube URL processing functionality in the reel-downloader application. The tests validate all the specific URLs mentioned in the task requirements and additional edge cases.

## Test Coverage

### 1. Unit Tests for URL Validation (`src/__tests__/utils/url-validation.test.ts`)
- **Platform Detection**: Tests the `detectPlatform` function
- **URL Validation**: Tests the `isValidUrl` function  
- **Video ID Extraction**: Tests the `extractYouTubeVideoId` function

### 2. API Route Tests (`src/__tests__/api/download.test.ts`)
- Tests the `/api/download` POST endpoint
- Validates YouTube URL processing logic
- Tests error handling for invalid URLs
- Tests platform support (YouTube, Instagram, Facebook)

### 3. Component Tests (`src/__tests__/components/reel-downloader.test.tsx`)
- Tests the React component UI behavior
- Validates platform detection display
- Tests button enable/disable logic
- Tests loading states and error handling

### 4. Integration Tests (`src/__tests__/integration/youtube-url-processing.test.tsx`)
- End-to-end testing of URL processing workflow
- Tests API and UI consistency
- Tests error handling across the full stack

## Specific Test URLs from Task Requirements

All tests validate the following specific URLs mentioned in the task:

✅ **https://www.youtube.com/watch?v=dQw4w9WgXcQ**
- Platform: YouTube
- Video ID: `dQw4w9WgXcQ`
- Status: ✓ Valid

✅ **https://youtube.com/shorts/Xqtf3xYk5vc?si=abc**
- Platform: YouTube  
- Video ID: `Xqtf3xYk5vc`
- Status: ✓ Valid

✅ **https://youtu.be/dQw4w9WgXcQ?t=43**
- Platform: YouTube
- Video ID: `dQw4w9WgXcQ`  
- Status: ✓ Valid

✅ **https://m.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=Rick**
- Platform: YouTube
- Video ID: `dQw4w9WgXcQ`
- Status: ✓ Valid

✅ **https://example.com/not-a-video** (Invalid non-YouTube URL)
- Platform: Unknown
- Video ID: null
- Status: ✗ Invalid (as expected)

## Test Features

### URL Pattern Support
- Standard YouTube URLs (`youtube.com/watch`)
- YouTube Shorts (`youtube.com/shorts/`)  
- Short URLs (`youtu.be/`)
- Mobile URLs (`m.youtube.com`)
- Embedded URLs (`youtube.com/embed/`, `youtube.com/v/`)

### Validation Logic
- **Video ID Extraction**: Validates 11-character alphanumeric video IDs
- **Platform Detection**: Identifies YouTube, Instagram, Facebook, and Unknown platforms
- **URL Format Validation**: Ensures proper URL structure
- **Error Handling**: Graceful handling of malformed URLs and invalid inputs

### Edge Cases Tested
- Empty URLs
- Invalid URL formats  
- Malformed YouTube URLs
- Video IDs with invalid lengths
- URLs without proper protocols
- Network errors and API failures

## Running the Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm test src/__tests__/utils/url-validation.test.ts
npm test src/__tests__/api/download.test.ts
npm test src/__tests__/components/reel-downloader.test.tsx
npm test src/__tests__/integration/youtube-url-processing.test.tsx

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Test Framework

- **Jest**: Primary testing framework
- **@testing-library/react**: React component testing
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Additional DOM matchers

## Key Testing Strategies

1. **Unit Testing**: Individual functions tested in isolation
2. **Component Testing**: React components tested with user interactions
3. **API Testing**: HTTP endpoints tested with mocked requests
4. **Integration Testing**: Full workflow testing from UI to API
5. **Error Boundary Testing**: Comprehensive error handling validation

## Test Metrics

- **Total Test Suites**: 4
- **Total Tests**: ~50+ test cases
- **Coverage Areas**: URL parsing, API routes, React components, integration flows
- **Validation Points**: All specified URLs plus edge cases and error conditions
