import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { messages, system } = await req.json()
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system,
      messages,
    }),
  })
  const data = await res.json()
  console.log("Anthropic response:", JSON.stringify(data).slice(0,300))
  return NextResponse.json(data)
}
