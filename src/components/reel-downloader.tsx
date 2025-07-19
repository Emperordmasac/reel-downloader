/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import {
  Download,
  Video,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Clock,
  Eye,
  Calendar,
} from "lucide-react";
interface VideoInfo {
  title: string;
  author?: string;
  duration: string;
  durationSeconds?: number;
  quality: string;
  videoId: string;
  downloadUrl: string;
  filename: string;
  fileSize?: string;
  container?: string;
  viewCount?: string;
  publishDate?: string;
  description?: string;
  thumbnail?: string;
  success: boolean;
}

const ReelDownloader = () => {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const detectPlatform = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "YouTube";
    } else if (url.includes("instagram.com")) {
      return "Instagram";
    } else if (url.includes("facebook.com") || url.includes("fb.watch")) {
      return "Facebook";
    }
    return "Unknown";
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setMessage("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setVideoInfo(null);

    try {
      const platform = detectPlatform(url);

      if (platform === "Unknown") {
        setMessage(
          "Unsupported platform. Please use YouTube, Instagram, or Facebook URLs.",
        );
        setIsLoading(false);
        return;
      }

      // Call our API route to process the video with timeout and retry
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, platform }),
        // Add timeout for the request
        signal: AbortSignal.timeout(30000), // 30 seconds timeout
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error status codes
        if (response.status === 408) {
          throw new Error(
            "Request timed out. Please try again with a shorter video or try later.",
          );
        }
        if (response.status === 413) {
          throw new Error(
            "Video is too large for processing. Please try with a shorter video.",
          );
        }
        if (response.status === 503) {
          throw new Error(
            "Service temporarily unavailable. Please try again in a few minutes.",
          );
        }
        throw new Error(data.error || "Failed to process video");
      }

      setVideoInfo(data);

      // Show custom message if available, otherwise default message
      if (data.message) {
        setMessage(data.message);
      } else {
        setMessage(`Video from ${platform} is ready for download!`);
      }
    } catch (error) {
      console.error("Download error:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setMessage(
            "Request timed out. Please try again with a shorter video.",
          );
        } else if (error.message.includes("Failed to fetch")) {
          setMessage(
            "Network error. Please check your connection and try again.",
          );
        } else {
          setMessage(error.message);
        }
      } else {
        setMessage("Error downloading video. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoDownload = async (videoInfo: VideoInfo) => {
    if (!videoInfo.downloadUrl || videoInfo.downloadUrl === "#") {
      setMessage("No download URL available for this video.");
      return;
    }

    setIsDownloading(true);
    setMessage("Starting download...");

    try {
      // Use our streaming endpoint to download the video
      const streamUrl = `/api/stream?url=${encodeURIComponent(
        videoInfo.downloadUrl,
      )}&filename=${encodeURIComponent(videoInfo.filename)}`;

      // Create a link to trigger the download
      const link = document.createElement("a");
      link.href = streamUrl;
      link.download = videoInfo.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage("Download started! Check your downloads folder.");
    } catch (error) {
      console.error("Download error:", error);
      setMessage("Failed to download video. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return detectPlatform(url) !== "Unknown";
    } catch {
      return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Video className="h-6 w-6" />
          Reel Downloader
        </CardTitle>
        <CardDescription>
          Paste your video URL from YouTube, Instagram, or Facebook to download
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full"
            disabled={isLoading}
          />
          {url && (
            <p className="text-sm text-muted-foreground">
              Platform detected: {detectPlatform(url)}
            </p>
          )}
        </div>

        <Button
          onClick={handleDownload}
          disabled={!url.trim() || !isValidUrl(url) || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Video
            </>
          )}
        </Button>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-md ${
              message.includes("ready") ||
              message.includes("started") ||
              message.includes("development")
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : message.includes("error") ||
                  message.includes("Error") ||
                  message.includes("failed") ||
                  message.includes("Failed")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
            }`}
          >
            {message.includes("ready") ||
            message.includes("started") ||
            message.includes("development") ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <p className="text-sm">{message}</p>
          </div>
        )}

        {videoInfo && (
          <div className="space-y-4">
            {/* Video Thumbnail and Basic Info */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex gap-4">
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    width={128}
                    alt={videoInfo.title}
                    className="w-32 h-24 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <h3 className="font-medium text-lg leading-tight">
                    {videoInfo.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {videoInfo.author && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{videoInfo.author}</span>
                      </div>
                    )}
                    {videoInfo.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{videoInfo.duration}</span>
                      </div>
                    )}
                    {videoInfo.viewCount && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>
                          {parseInt(videoInfo.viewCount).toLocaleString()} views
                        </span>
                      </div>
                    )}
                  </div>
                  {videoInfo.publishDate && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(videoInfo.publishDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Technical Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {videoInfo.quality && (
                  <p>
                    <strong>Quality:</strong> {videoInfo.quality}
                  </p>
                )}
                {videoInfo.fileSize && (
                  <p>
                    <strong>File Size:</strong> {videoInfo.fileSize}
                  </p>
                )}
                {videoInfo.container && (
                  <p>
                    <strong>Format:</strong> {videoInfo.container}
                  </p>
                )}
                <p>
                  <strong>Video ID:</strong> {videoInfo.videoId}
                </p>
              </div>
            </div>

            {/* Download Button */}
            <Button
              onClick={() => handleVideoDownload(videoInfo)}
              disabled={
                isDownloading ||
                !videoInfo.downloadUrl ||
                videoInfo.downloadUrl === "#"
              }
              className="w-full"
              size="lg"
              variant="default"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download{" "}
                  {videoInfo.fileSize ? `(${videoInfo.fileSize})` : "Video"}
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          <p>Supported platforms: YouTube, Instagram, Facebook</p>
          <p>Please respect copyright and platform terms of service</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReelDownloader;
