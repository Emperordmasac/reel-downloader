/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

// Add timeout wrapper for serverless environments
const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 8000,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs),
    ),
  ]);
};

export async function POST(request: NextRequest) {
  try {
    const { url, platform } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    // Handle YouTube videos
    if (platform === "YouTube") {
      // Enhanced YouTube URL validation (supports regular videos, shorts, and youtu.be links)
      // Regex groups: 1 = youtube.com video ID, 2 = youtu.be video ID
      // Use word boundaries (\b) to ensure exact 11-character match and not longer strings
      const youtubeRegex =
        /(?:youtube\.com\/(?:(?:watch\?v=|embed\/|v\/)|shorts\/)([a-zA-Z0-9_-]{11})(?:\b|&|$)|youtu\.be\/([a-zA-Z0-9_-]{11})(?:\b|\?|$))/;
      const match = url.match(youtubeRegex);

      // Handle edge case: no regex match (malformed YouTube URL)
      if (!match) {
        return NextResponse.json(
          {
            error:
              "Invalid YouTube URL format. Please provide a valid YouTube video URL.",
          },
          { status: 400 },
        );
      }

      // Capture regex group 1 (youtube.com format) or group 2 (youtu.be format) for downstream use
      const videoId = match[1] || match[2];

      // Handle edge case: missing video ID (this shouldn't happen with our regex, but safety check)
      if (!videoId || videoId.length !== 11) {
        return NextResponse.json(
          { error: "Unable to extract valid video ID from YouTube URL" },
          { status: 400 },
        );
      }

      try {
        // Validate the YouTube URL with ytdl-core with timeout
        const isValidUrl = await withTimeout(
          Promise.resolve(ytdl.validateURL(url)),
          3000,
        );

        if (!isValidUrl) {
          return NextResponse.json(
            {
              error:
                "Invalid YouTube URL. Video may be private, unavailable, or restricted.",
            },
            { status: 400 },
          );
        }

        // Get video information with timeout
        const info = await withTimeout(ytdl.getInfo(url), 8000);
        const videoDetails = info.videoDetails;

        // Choose the best available format
        const format = ytdl.chooseFormat(info.formats, {
          quality: "highest",
          filter: "audioandvideo",
        });

        // If no audioandvideo format, fall back to highest quality available
        const fallbackFormat =
          format || ytdl.chooseFormat(info.formats, { quality: "highest" });

        if (!fallbackFormat) {
          return NextResponse.json(
            { error: "No downloadable formats available for this video." },
            { status: 400 },
          );
        }

        // Clean filename for download
        const cleanTitle = videoDetails.title
          .replace(/[^a-zA-Z0-9\s\-_]/g, "")
          .trim();
        const filename = `${cleanTitle}_${videoId}.${
          fallbackFormat.container || "mp4"
        }`;

        // Format duration
        const durationSeconds = parseInt(videoDetails.lengthSeconds);
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;
        const formattedDuration = `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`;

        return NextResponse.json({
          title: videoDetails.title,
          author: videoDetails.author?.name || "Unknown",
          duration: formattedDuration,
          durationSeconds: durationSeconds,
          quality:
            fallbackFormat.qualityLabel || fallbackFormat.quality || "Unknown",
          videoId: videoId,
          downloadUrl: fallbackFormat.url,
          filename: filename,
          fileSize: fallbackFormat.contentLength
            ? `${(parseInt(fallbackFormat.contentLength) / 1024 / 1024).toFixed(
                1,
              )} MB`
            : "Unknown",
          container: fallbackFormat.container,
          viewCount: videoDetails.viewCount,
          publishDate: videoDetails.publishDate,
          description:
            videoDetails.description?.substring(0, 200) + "..." || "",
          thumbnail: videoDetails.thumbnails?.[0]?.url || null,
          success: true,
        });
      } catch (error: any) {
        console.error("YouTube processing error:", error);

        // Handle timeout errors specifically
        if (error.message?.includes("Request timeout")) {
          return NextResponse.json(
            {
              error:
                "Request timed out. This might be due to server limitations. Please try again or use a different video.",
            },
            { status: 408 },
          );
        }

        // Handle specific ytdl errors
        if (error.message?.includes("Video unavailable")) {
          return NextResponse.json(
            {
              error:
                "Video is unavailable. It may be private, deleted, or geo-restricted.",
            },
            { status: 400 },
          );
        }

        if (error.message?.includes("Sign in to confirm your age")) {
          return NextResponse.json(
            { error: "This video is age-restricted and cannot be downloaded." },
            { status: 400 },
          );
        }

        if (error.message?.includes("Private video")) {
          return NextResponse.json(
            { error: "This is a private video and cannot be downloaded." },
            { status: 400 },
          );
        }

        // Handle network-related errors
        if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
          return NextResponse.json(
            {
              error:
                "Network error. Please check your connection and try again.",
            },
            { status: 503 },
          );
        }

        // Handle memory errors
        if (
          error.message?.includes("memory") ||
          error.message?.includes("heap")
        ) {
          return NextResponse.json(
            {
              error:
                "Server resource limit reached. Please try with a shorter video or try again later.",
            },
            { status: 413 },
          );
        }

        return NextResponse.json(
          { error: "Failed to process YouTube video. Please try again later." },
          { status: 500 },
        );
      }
    }

    // Handle Instagram (basic implementation - Instagram requires more complex handling)
    if (platform === "Instagram") {
      // Instagram videos require more complex scraping due to their API restrictions
      // This is a placeholder implementation
      return NextResponse.json(
        {
          error:
            "Instagram downloads require additional setup. Please check the documentation.",
        },
        { status: 501 },
      );
    }

    // Handle Facebook (basic implementation - Facebook requires more complex handling)
    if (platform === "Facebook") {
      // Facebook videos require more complex scraping due to their API restrictions
      // This is a placeholder implementation
      return NextResponse.json(
        {
          error:
            "Facebook downloads require additional setup. Please check the documentation.",
        },
        { status: 501 },
      );
    }

    return NextResponse.json(
      { error: "Unsupported platform" },
      { status: 400 },
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
