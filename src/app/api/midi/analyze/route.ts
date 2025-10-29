import { NextRequest, NextResponse } from "next/server";

const MIDI_ANALYZER_API_URL = process.env.MIDI_ANALYZER_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const barsPerPhrase = formData.get("bars_per_phrase") || "4";

    if (!file) {
      return NextResponse.json(
        { error: "MIDI 파일이 필요합니다." },
        { status: 400 }
      );
    }

    // Validate MIDI file
    if (!file.name.match(/\.(mid|midi)$/i)) {
      return NextResponse.json(
        { error: "올바른 MIDI 파일(.mid, .midi)을 업로드해주세요." },
        { status: 400 }
      );
    }

    // Forward request to Python API
    const apiFormData = new FormData();
    apiFormData.append("file", file);
    apiFormData.append("bars_per_phrase", barsPerPhrase.toString());

    const response = await fetch(`${MIDI_ANALYZER_API_URL}/analyze`, {
      method: "POST",
      body: apiFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || "MIDI 분석 중 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("MIDI analysis error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
