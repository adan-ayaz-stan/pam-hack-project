import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { createElement, HTMLProps } from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeReact from 'rehype-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { type Message } from 'ai/react';

type MessageProps = HTMLProps<HTMLDivElement> & {
  role: Message['role'];
  message: string;
  toolInvocations?: any[];
};

export default function Message({
  role,
  message,
  className,
  toolInvocations,
  ...props
}: MessageProps) {
  if (message.length <= 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        {...props}
        className={cn(
          'flex w-full max-w-xl flex-row gap-4 rounded-bl-xl rounded-tr-xl bg-primary p-4 text-primary-foreground',
          role == 'user' &&
            'ml-auto rounded-bl-none rounded-br-xl rounded-tl-xl rounded-tr-none bg-accent',
          className
        )}
      >
        <Avatar
          className={cn(role == 'user' && 'border-2 border-primary-foreground')}
        >
          <AvatarImage></AvatarImage>
          <AvatarFallback className="text-primary-foreground">
            {role === 'user' ? 'U' : 'AI'}
          </AvatarFallback>
        </Avatar>
        {/*  */}
        <Markdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[
            rehypeKatex,
            rehypeRaw,
            [rehypeReact, { createElement: createElement }]
          ]}
          components={{
            code(props: any) {
              const { children, className, node, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <div className="bg-davy flex flex-col rounded-xl">
                  <div className="bg-scampi-100 rounded-t-md px-4 py-2 text-sm text-primary">
                    {match[1]}
                  </div>
                  {/* @ts-ignore */}
                  <SyntaxHighlighter
                    {...rest}
                    PreTag="div"
                    // eslint-disable-next-line react/no-children-prop
                    children={String(children).replace(/\n$/, '')}
                    language={match[1]}
                    style={atomDark}
                    codeTagProps={{ className: 'text-sm' }}
                  />
                </div>
              ) : (
                <pre className="w-full rounded-lg bg-gray-950 p-2 px-4">
                  <code {...rest} className={cn('text-sm', className)}>
                    {children}
                  </code>
                </pre>
              );
            },
            ul(props: any) {
              return (
                <ul
                  className="list-outside list-disc space-y-2 py-2 md:ml-3"
                  {...props}
                />
              );
            },
            ol(props: any) {
              return (
                <ol
                  className="list-outside list-decimal space-y-2 py-2 md:ml-3"
                  {...props}
                />
              );
            },
            li(props: any) {
              return <li className="pl-2 md:border-l-2" {...props} />;
            }
          }}
          className={cn('flex-1 text-sm')}
        >
          {message}
        </Markdown>
      </div>
    </div>
  );
}
