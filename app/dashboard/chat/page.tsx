import PageContainer from '@/components/layout/page-container';
import ChatForm from './_components/ChatForm';
import ChatMessages from './_components/ChatMessages';

export default function ChatPage() {
  return (
    <PageContainer scrollable>
      <div className="pb-32">
        <ChatForm>
          <ChatMessages />
        </ChatForm>
      </div>
    </PageContainer>
  );
}
