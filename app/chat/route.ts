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
    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: `messages` must be an array.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server misconfiguration: OPENAI_API_KEY not set.' },
        { status: 500 }
      );
    }

    // Construct the conversation for OpenAI. We use a system message to
    // instruct the model to return JSON containing both the answer and
    // suggestions. Each incoming message is mapped to the roles that
    // OpenAI expects ("user" or "assistant").
    const openaiMessages = [
      {
        role: 'system',
        content:
          'You are a helpful career assistant. When responding to a user, ' +
          'return a JSON object with two keys: "response" containing your ' +
          'reply to the user, and "suggestions" containing an array of up to ' +
          'four concise follow‑up question suggestions. Do not include any ' +
          'markdown or additional commentary – return strictly valid JSON.'
      },
      ...messages.map((msg: ChatMessage) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: openaiMessages,
        temperature: 0.7
      })
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      return NextResponse.json(
        { error: 'OpenAI API error', details: errorText },
        { status: apiRes.status }
      );
    }

    const data = await apiRes.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Invalid response from OpenAI' },
        { status: 500 }
      );
    }

    // Parse the JSON returned by the assistant. If parsing fails we
    // fall back to returning the raw content string.
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return NextResponse.json({ response: content, suggestions: [] });
    }

    return NextResponse.json({
      response: parsed.response ?? '',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Unexpected server error', details: err?.message },
      { status: 500 }
    );
  }
}
