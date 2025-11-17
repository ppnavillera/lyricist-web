import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { syllableCount, context } = await request.json();

    if (!syllableCount || syllableCount < 1) {
      return NextResponse.json(
        { error: "음절 수는 1 이상이어야 합니다." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = generatePrompt(syllableCount, context);

    console.log("=== Gemini Prompt ===");
    console.log(prompt);
    console.log("===================");

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("=== Gemini Response ===");
    console.log(text);
    console.log("=====================");

    // Parse the response to extract syllables
    const lyrics = parseLyricsFromResponse(text, syllableCount);

    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "가사 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

function generatePrompt(
  syllableCount: number,
  context?: {
    previousLines?: string[];
    theme?: { genres?: string[]; moods?: string[]; keywords?: string[] };
  }
): string {
  let prompt = `한국어로 정확히 ${syllableCount}글자로 된 노래 가사를 만들어 주세요.

필수 출력 형식:
${syllableCount}부터 1까지 각 숫자 k에 대해 다음을 수행합니다:
- 마커 <k>를 출력합니다.
- 이 마커 뒤에 한국어 글자 하나를 즉시 붙여서 작성합니다. (글자는 공백이나 구두점을 포함하지 않는 순수 한글 자소 하나를 의미합니다. 예: '사', '랑', '해', '요' 등. 마커와 마커 사이에는 오직 한 글자만 있어야 합니다.)
- <1>과 짝을 이룬 글자 다음에 <0>을 작성하고, 더 이상 아무것도 생성하지 마십시오.

마커 (<k>, <0>)와 구두점(예: 마침표, 쉼표 등)은 ${syllableCount}글자 총량에 포함되지 않습니다. 오직 한국어 글자 자체만 계산됩니다.

길이가 부족할 위험이 있다면, 단순히 빈 마커만 나열하여 끝내지 마십시오. 신선하고 의미 있는 내용을 추가하십시오. 줄 바꿈이나 반복되는 채우기 문구는 허용되지 않습니다.

글자 수 및 순서 규칙:
- 정확히 ${syllableCount}개의 마커 (<${syllableCount}> ... <1>)와 정확히 ${syllableCount}개의 글자를 생성해야 합니다.
- 연속적인 마커 내부의 숫자는 1씩 감소해야 합니다 (건너뛰거나 반복되지 않아야 합니다).
- 두 개의 마커가 사이에 글자 없이 연속적으로 나타나서는 안 됩니다.
- <0> 뒤에는 어떠한 추가 텍스트도 허용되지 않습니다 (심지어 줄 바꿈도).`;

  // Add context if provided
  if (context) {
    if (context.previousLines && context.previousLines.length > 0) {
      prompt += `\n\n이전 줄들:\n${context.previousLines.join("\n")}`;
      prompt += `\n\n위 내용과 자연스럽게 이어지는 가사를 작성해주세요.`;
    }

    if (context.theme) {
      const { genres, moods, keywords } = context.theme;
      if (genres && genres.length > 0) {
        prompt += `\n\n장르: ${genres.join(", ")}`;
      }
      if (moods && moods.length > 0) {
        prompt += `\n분위기: ${moods.join(", ")}`;
      }
      if (keywords && keywords.length > 0) {
        prompt += `\n키워드: ${keywords.join(", ")}`;
      }
    }
  }

  return prompt;
}

function parseLyricsFromResponse(text: string, syllableCount: number): string {
  // Extract characters between markers
  const lyrics: string[] = [];

  for (let i = syllableCount; i >= 1; i--) {
    const markerRegex = new RegExp(`<${i}>(.)<${i - 1}>`, "s");
    const match = text.match(markerRegex);

    if (match && match[1]) {
      lyrics.push(match[1]);
    }
  }

  if (lyrics.length === syllableCount) {
    return lyrics.join("");
  }

  // Fallback: try to extract any Korean characters
  const koreanChars = text.match(/[가-힣]/g);
  if (koreanChars && koreanChars.length >= syllableCount) {
    return koreanChars.slice(0, syllableCount).join("");
  }

  throw new Error("Failed to parse lyrics from Gemini response");
}
