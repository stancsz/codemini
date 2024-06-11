import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      response_format: { "type": "json_object" },
      messages: [
        { role: 'system', content: 'Produce JSON. Edit the files based on user prompts, only return the files you have modified. in the format of: [{filepath:"", code:""}, {filepath:"", code:""}...]'},
        { role: 'user', content: message }
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return NextResponse.json({ response: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: 'Error communicating with OpenAI' }, { status: 500 });
  }
}