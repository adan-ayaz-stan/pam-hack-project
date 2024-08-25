'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { UserClient } from '@/components/tables/user-tables/client';
import { User, users } from '@/constants/data';
import { getAllSubscribers } from '@/server/actions/subscriptions.actions';
import { useQuery } from '@tanstack/react-query';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'User', link: '/dashboard/user' }
];
export default function Page() {
  const { data: usersQuery } = useQuery({
    queryKey: ['users', 'subscriptions'],
    queryFn: () => getAllSubscribers()
  });

  const usersTransform: User[] =
    usersQuery?.map((user) => {
      return {
        id: user.id,
        name: user.name,
        make: user.vehicle_make,
        plate: user.vehicle_plate,
        status: user.subscription
      };
    }) ?? [];

  return (
    <PageContainer>
      <div className="space-y-2">
        <Breadcrumbs items={breadcrumbItems} />
        <UserClient data={usersTransform} />
      </div>
    </PageContainer>
  );
}
