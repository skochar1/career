/*
 * API route for handling chat interactions with the OpenAI API.
 *
 * This route expects a JSON payload with a `messages` array where each
 * element has a `type` (`"user"` or `"assistant"`) and `content` string.
 * It forwards the conversation to OpenAI's Chat Completion endpoint and
 * returns the assistant's response along with follow‑up suggestions. To
 * function correctly this route requires an `OPENAI_API_KEY` environment
 * variable to be set.
 */

import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY missing!");
      return NextResponse.json({ error: 'OPENAI_API_KEY not set.' }, { status: 500 });
    }

    // System prompt: strictly minified JSON, max four suggestions
    const openaiMessages = [
      {
        role: 'system',
        content:
          'You are a helpful career assistant. Always respond strictly as a minified JSON object with two keys: "response" (string) and "suggestions" (array of up to four strings). Do not include any text or formatting outside the JSON object. Example: {"response":"Your answer here","suggestions":["Follow-up 1","Follow-up 2"]}'
      },
      ...messages.map((msg: ChatMessage) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    // Debug logging
    console.log("API /api/chat called at", new Date().toISOString());
    console.log("OpenAI messages:", JSON.stringify(openaiMessages, null, 2));
    console.log("API KEY starts with:", apiKey.slice(0, 8));

    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // <-- fallback for higher rate limits
        messages: openaiMessages,
        temperature: 0.3
      })
    });

    if (apiRes.status === 429) {
      const errText = await apiRes.text();
      console.error("429 error details:", errText);
      return NextResponse.json({
        response: "I'm being rate-limited by OpenAI. Please wait a minute before trying again.",
        suggestions: [],
      });
    }

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error("OpenAI API error:", errorText);
      return NextResponse.json(
        { error: 'OpenAI API error', details: errorText },
        { status: apiRes.status }
      );
    }

    const data = await apiRes.json();
    const content = data?.choices?.[0]?.message?.content;
    console.log("OPENAI RAW CONTENT:", content);

    if (!content) {
      return NextResponse.json({ error: 'Invalid response from OpenAI' }, { status: 500 });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", content);
      return NextResponse.json({ response: content, suggestions: [] });
    }

    return NextResponse.json({
      response: parsed.response ?? '',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    });
  } catch (err: any) {
    console.error("Server error in /api/chat:", err);
    return NextResponse.json(
      { error: 'Unexpected server error', details: err?.message },
      { status: 500 }
    );
  }
}
