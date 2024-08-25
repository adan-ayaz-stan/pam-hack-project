'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAllSubscribers } from '@/server/actions/subscriptions.actions';
import { useQuery } from '@tanstack/react-query';

export function RecentSales() {
  const { data: subscribers, isSuccess } = useQuery({
    queryKey: ['users', 'subscriptions'],
    queryFn: () => getAllSubscribers()
  });

  return (
    <div className="space-y-8">
      {isSuccess &&
        subscribers?.map((subscriber) => (
          <div key={subscriber.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>
                {subscriber.name.split(' ')[0][0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {subscriber.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {subscriber.user_id}
              </p>
            </div>
            <div className="ml-auto font-medium">+$29.99</div>
          </div>
        ))}
    </div>
  );
}
