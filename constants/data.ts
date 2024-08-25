import { NavItem } from '@/types';

export type User = {
  id: string | number;
  name: string;
  make: string;
  plate: string;
  status: string;
};
export const users: User[] = [
  {
    id: 1,
    name: 'Candice Schiner',
    make: 'Dell',
    plate: 'Frontend Developer',

    status: 'Active'
  },
  {
    id: 2,
    name: 'John Doe',
    make: 'TechCorp',
    plate: 'Backend Developer',

    status: 'Active'
  },
  {
    id: 3,
    name: 'Alice Johnson',
    make: 'WebTech',
    plate: 'UI Designer',

    status: 'Active'
  },
  {
    id: 4,
    name: 'David Smith',
    make: 'Innovate Inc.',
    plate: 'Fullstack Developer',

    status: 'Inactive'
  },
  {
    id: 5,
    name: 'Emma Wilson',
    make: 'TechGuru',
    plate: 'Product Manager',

    status: 'Active'
  },
  {
    id: 6,
    name: 'James Brown',
    make: 'CodeGenius',
    plate: 'QA Engineer',

    status: 'Active'
  },
  {
    id: 7,
    name: 'Laura White',
    make: 'SoftWorks',
    plate: 'UX Designer',

    status: 'Active'
  },
  {
    id: 8,
    name: 'Michael Lee',
    make: 'DevCraft',
    plate: 'DevOps Engineer',

    status: 'Active'
  },
  {
    id: 9,
    name: 'Olivia Green',
    make: 'WebSolutions',
    plate: 'Frontend Developer',

    status: 'Active'
  },
  {
    id: 10,
    name: 'Robert Taylor',
    make: 'DataTech',
    plate: 'Data Analyst',

    status: 'Active'
  }
];

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
};

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard'
  },
  {
    title: 'Auto Chat',
    href: '/dashboard/chat',
    icon: 'spinner',
    label: 'Auto Chat'
  },
  {
    title: 'User Subscriptions',
    href: '/dashboard/user',
    icon: 'user',
    label: 'user'
  },

  // {
  //   title: 'Profile',
  //   href: '/dashboard/profile',
  //   icon: 'profile',
  //   label: 'profile'
  // },
  {
    title: 'Engineers Dash',
    href: '/dashboard/kanban',
    icon: 'kanban',
    label: 'kanban'
  }
  // {
  //   title: 'Login',
  //   href: '/',
  //   icon: 'login',
  //   label: 'login'
  // }
];
