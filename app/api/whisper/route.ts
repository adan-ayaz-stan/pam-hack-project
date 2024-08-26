import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { UploadApiResponse } from 'cloudinary';
import { auth } from '@/auth';

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Prompt is required.'
  }),
  voice: z.enum(['alloy', 'fable', 'onyx', 'nova', 'shimmer']),
  public: z.boolean().default(true)
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const parsed = formSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: parsed.data.voice,
      input: parsed.data.prompt
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const audioBlob = new Blob([buffer], {
      type: 'audio/wav'
    });

    // Construct the audioBlob into a File object
    const file = new File([audioBlob], 'audio.wav', {
      type: 'audio/wav'
    });

    const generateUniqueUploadId = () => {
      return `uqid-${Date.now()}`;
    };

    const uniqueUploadId = generateUniqueUploadId();
    const chunkSize = 5 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;

    const uploadChunk = async (start: number, end: number) => {
      const formData = new FormData();
      formData.append('file', file.slice(start, end));
      formData.append(
        'folder',
        '/users/' + session?.user?.email + '/temp/text-to-speech/'
      );
      formData.append('cloud_name', 'ddfjwg2rb');
      formData.append('upload_preset', 'music-preset');
      const contentRange = `bytes ${start}-${end - 1}/${file.size}`;

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/ddfjwg2rb/auto/upload`,
          {
            method: 'POST',
            body: formData,
            headers: {
              'X-Unique-Upload-Id': uniqueUploadId,
              'Content-Range': contentRange
            }
          }
        );

        if (!response.ok) {
          throw new Error('Chunk upload failed.');
        }

        currentChunk++;

        if (currentChunk < totalChunks) {
          const nextStart = currentChunk * chunkSize;
          const nextEnd = Math.min(nextStart + chunkSize, file.size);
          uploadChunk(nextStart, nextEnd);
        } else {
          const fetchResponse: UploadApiResponse = await response.json();

          return NextResponse.json({ url: fetchResponse.secure_url });
        }
      } catch (error) {
        return new NextResponse('Error uploading chunk: ' + error, {
          status: 500
        });
      }
    };

    const start = 0;
    const end = Math.min(chunkSize, file.size);
    return await uploadChunk(start, end);
  } catch (err) {
    return new NextResponse('Internal Server Error', {
      status: 500
    });
  }
}
