import { NextRequest, NextResponse } from "next/server";

// Add timeout wrapper for serverless environments
const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 15000,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs),
    ),
  ]);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const downloadUrl = searchParams.get("url");
    const filename = searchParams.get("filename");

    if (!downloadUrl) {
      return NextResponse.json(
        { error: "Download URL is required" },
        { status: 400 },
      );
    }

    // Validate the download URL
    try {
      new URL(downloadUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid download URL format" },
        { status: 400 },
      );
    }

    // Fetch the video content with timeout and proper headers
    const response = await withTimeout(
      fetch(downloadUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
          DNT: "1",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
        // Add timeout to the fetch request
        signal: AbortSignal.timeout(15000),
      }),
      15000,
    );

    if (!response.ok) {
      console.error(
        "Stream fetch error:",
        response.status,
        response.statusText,
      );
      return NextResponse.json(
        {
          error: `Failed to fetch video content: ${response.status} ${response.statusText}`,
        },
        { status: response.status },
      );
    }

    // Get the content type from the original response
    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length");

    // Create response headers for download with CORS support
    const headers = new Headers({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${
        filename || "video.mp4"
      }"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      // Add CORS headers for Vercel
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    // Stream the video content
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    console.error("Stream error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorCode = (error as { code?: string })?.code;

    // Handle specific error types
    if (errorMessage.includes("Request timeout")) {
      return NextResponse.json(
        { error: "Download request timed out. Please try again." },
        { status: 408 },
      );
    }

    if (
      (error as Error).name === "AbortError" ||
      errorMessage.includes("aborted")
    ) {
      return NextResponse.json(
        { error: "Download request was cancelled or timed out." },
        { status: 408 },
      );
    }

    if (errorCode === "ENOTFOUND" || errorCode === "ECONNREFUSED") {
      return NextResponse.json(
        { error: "Network error. Please check your connection and try again." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to stream video content. Please try again." },
      { status: 500 },
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
