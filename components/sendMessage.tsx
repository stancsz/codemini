import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

let openaiApiKey = '';

const getOpenAiKey = async () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, `user/${currentUser.uid}/openai`, 'token');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          resolve(docSnap.data().apiKey);
        } else {
          reject(new Error('No API key found'));
        }
      } else {
        reject(new Error('User not logged in'));
      }
    });
  });
};

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  try {
    if (!openaiApiKey) {
      openaiApiKey = await getOpenAiKey();
    }
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Produce JSON. Add, or edit the files (default python) based on user prompts, only return the files you have modified. in the format of: {"message":"your message","files": [{"filename": "filepath1", "code": "code1"},{"filename": "filepath2", "code": "code2"}]}',
        },
        { role: 'user', content: message },
      ],
      temperature: 1,
      max_tokens: 4000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return NextResponse.json({ response: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: 'Error communicating with OpenAI' }, { status: 500 });
  }
}
