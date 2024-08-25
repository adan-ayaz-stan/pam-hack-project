'use client';

import { Button } from '@/components/ui/button';
import { Message, useChat } from 'ai/react';
import { createContext, SVGProps } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  input: z.string().min(2).max(500)
});

export const MessagesContext = createContext<Message[]>([]);

export default function ChatForm({ children }: { children?: React.ReactNode }) {
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
    onFinish() {
      setInput('');
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  });

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
