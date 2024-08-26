'use client';

import { Button } from '@/components/ui/button';
import { Message, useChat } from 'ai/react';
import { createContext, SVGProps, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import WavesurferPlayer from '@wavesurfer/react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import { Mic } from 'lucide-react';

const formSchema = z.object({
  input: z.string().min(2).max(500)
});

export const MessagesContext = createContext<Message[]>([]);

export default function ChatForm({ children }: { children?: React.ReactNode }) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [wavesurferOutput, setWavesurferOutput] = useState<WaveSurfer | null>(
    null
  );
  const [recorder, setRecorder] = useState<RecordPlugin | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
    setIsPlaying(false);
  };

  const onReadyOutput = (ws: WaveSurfer) => {
    setWavesurferOutput(ws);
  };

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause();
  };

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input: ''
    }
  });

  const { isLoading, setInput, input, handleSubmit, messages } = useChat({
    api: '/api/mistral/chat',
    maxToolRoundtrips: 2,
    onResponse() {
      // Scroll the document to the end
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    },
    onFinish: async (message) => {
      // Call whisper model here

      //
      setInput('');
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  });

  useEffect(() => {
    if (wavesurferOutput) {
      const record = wavesurferOutput.registerPlugin(
        RecordPlugin.create({
          scrollingWaveform: false
        })
      );

      setRecorder(record);
    }
  }, [wavesurferOutput]);

  return (
    <MessagesContext.Provider value={messages}>
      {children}
      <div className="mx-auto w-full max-w-xl">
        <Form {...form}>
          <form
            id="ai-chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            className="shadow-davy fixed bottom-12 w-full max-w-xl rounded-xl bg-primary p-4 shadow-2xl max-lg:bottom-0 max-lg:left-1/2 max-lg:-translate-x-1/2"
          >
            {/*  */}

            <div className="absolute right-full w-1/2 -translate-x-4 rounded-xl bg-slate-800 p-2">
              <WavesurferPlayer
                height={100}
                barWidth={4}
                barGap={2}
                barRadius={3}
                waveColor="yellow"
                cursorWidth={0}
                onInit={(ws) => {
                  setWavesurferOutput(ws);
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <Button
                className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
                onClick={() => {
                  if (recorder) {
                    recorder.startMic();
                    recorder.startRecording();
                  }
                }}
                type="button"
              >
                <Mic />
              </Button>
            </div>
            <div className="absolute left-full w-1/2 translate-x-4 rounded-xl bg-slate-800 p-2">
              <WavesurferPlayer
                height={100}
                barWidth={4}
                barGap={2}
                barRadius={3}
                cursorWidth={0}
                waveColor="violet"
                url={
                  audioUrl ??
                  'https://s3u.tmimgcdn.com/u2281092/20a6e987b2d726d489b6d33219b21a3d.mp3'
                }
                onReady={onReady}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              <div className="absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded bg-primary p-3 py-1">
                <Mic /> AI
              </div>
            </div>

            {/*  */}
            <div className="relative flex flex-row items-end gap-1 rounded-xl p-4">
              <textarea
                name="input"
                rows={2}
                value={input}
                placeholder="My car broke down..."
                onChange={(e) => setInput(e.target.value)}
                className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white max-h-40 min-h-12 w-full resize-y bg-primary text-white placeholder:text-gray-300 focus-visible:outline-none"
              ></textarea>

              <Button
                className={cn('h-fit w-fit p-2', isLoading && 'animate-pulse')}
                size={'icon'}
                variant={'secondary'}
                type="submit"
                disabled={isLoading}
              >
                <MaterialSymbolsSendOutline className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MessagesContext.Provider>
  );
}

export function MaterialSymbolsSendOutline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M3 20V4l19 8zm2-3l11.85-5L5 7v3.5l6 1.5l-6 1.5zm0 0V7z"
      ></path>
    </svg>
  );
}
