'use client';

import { SVGProps, useContext } from 'react';
import { MessagesContext } from './ChatForm';
import Message from './Message';

const dummyMessages = [
  {
    id: 1,
    role: 'user',
    content: 'hi',
    toolInvocations: []
  },
  {
    id: 2,
    role: 'assistant',
    content: 'What would you like to know about?',
    toolInvocations: []
  },
  {
    id: 3,
    role: 'user',
    content: 'my name is john',
    toolInvocations: []
  }
];

export default function ChatMessages() {
  const messages = useContext(MessagesContext);

  return (
    <div className="space-y-4 pb-20">
      {messages.length === 0 && (
        <div className="flex flex-col items-center gap-4 text-center">
          <MaterialSymbolsLogoDev className="mx-auto h-12 w-12" />
          <p className="mx-auto max-w-md">Spitfire&apos;s Auto Assistant</p>
        </div>
      )}

      {/*  */}
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          message={message.content}
          toolInvocations={message.toolInvocations}
        />
      ))}
      {/* {dummyMessages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          message={message.content}
          toolInvocations={message.toolInvocations}
        />
      ))} */}
    </div>
  );
}

export function MaterialSymbolsLogoDev(props: SVGProps<SVGSVGElement>) {
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
        d="M6 15h2.4q.475 0 .813-.337t.337-.813v-3.7q0-.475-.337-.812T8.4 9H6zm1.15-1.15v-3.7H8.4v3.7zM10.875 15h2.45v-1.15h-2.05v-1.3h1.3V11.4h-1.3v-1.25h2.05V9h-2.45q-.325 0-.537.212t-.213.538v4.5q0 .325.213.538t.537.212m5.15-.025q.325 0 .563-.213t.312-.537L18.3 9h-1.2l-1.075 4.1L14.95 9h-1.2l1.4 5.225q.075.325.313.538t.562.212M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21z"
      ></path>
    </svg>
  );
}
