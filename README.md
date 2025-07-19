# Reel Downloader

A modern web application built with Next.js that allows users to download videos from YouTube, Instagram, and Facebook by simply pasting the video URL.

## Features

- 🎥 **Multi-platform Support**: Download videos from YouTube, Instagram, and Facebook
- 🎨 **Modern UI**: Clean, responsive design using shadcn/ui components
- ⚡ **Fast Processing**: Efficient video processing and download
- 📱 **Mobile Friendly**: Responsive design works on all devices
- 🌙 **Dark Mode**: Automatic dark/light mode support
- 🔒 **Privacy Focused**: No data stored, downloads processed securely

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Video Processing**: ytdl-core
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Paste URL**: Copy a video URL from YouTube, Instagram, or Facebook and paste it into the input field
2. **Platform Detection**: The app automatically detects the platform
3. **Download**: Click the "Download Video" button to process and download the video
4. **Save**: The video will be downloaded to your default downloads folder

## Supported Platforms

### ✅ YouTube
- Full support for all YouTube videos
- High-quality video downloads
- Metadata extraction (title, duration, quality)

### ⚠️ Instagram (Limited)
- Basic framework in place
- Requires additional setup due to Instagram's API restrictions
- Consider using third-party services or scraping tools

### ⚠️ Facebook (Limited)
- Basic framework in place
- Requires additional setup due to Facebook's API restrictions
- Consider using third-party services or scraping tools

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── download/
│   │       └── route.ts          # API endpoint for video processing
│   ├── globals.css               # Global styles and CSS variables
│   └── page.tsx                  # Main page component
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── reel-downloader.tsx       # Main downloader component
└── lib/
    └── utils.ts                  # Utility functions
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Limitations & Considerations

### Legal & Ethical
- **Copyright**: Respect copyright laws and platform terms of service
- **Rate Limits**: Be mindful of API rate limits
- **Terms of Service**: Ensure compliance with platform ToS

### Technical
- **Instagram/Facebook**: These platforms have strict anti-scraping measures
- **Video Quality**: Quality depends on source availability
- **File Size**: Large videos may take longer to process

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Disclaimer

This tool is for educational and personal use only. Users are responsible for ensuring they comply with applicable copyright laws and platform terms of service. The developers are not responsible for any misuse of this application.

---

**Note**: Instagram and Facebook downloads require additional setup due to their API restrictions. Consider implementing proper authentication and following their developer guidelines for production use.
