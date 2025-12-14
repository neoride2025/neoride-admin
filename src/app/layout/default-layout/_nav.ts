import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-home' },
  },
  // {
  //   title: true,
  //   name: 'Rides'
  // },
  // {
  //   name: 'Menu 1',
  //   iconComponent: { name: 'cil-dollar' }
  // },
  // {
  //   name: 'Menu 2',
  //   iconComponent: { name: 'cil-dollar' }
  // },
  // {
  //   name: 'Menu 3',
  //   iconComponent: { name: 'cil-dollar' }
  // },
  // {
  //   name: 'Menu 4',
  //   iconComponent: { name: 'cil-dollar' }
  // },
  // {
  //   title: true,
  //   name: 'Payments'
  // },
  // {
  //   name: 'Received',
  //   iconComponent: { name: 'cil-dollar' }
  // },
  // {
  //   name: 'Refunded',
  //   iconComponent: { name: 'cil-paper-plane' }
  // },
  {
    title: true,
    name: 'Customer Support'
  },
  // {
  //   name: 'Privacy Policy',
  //   iconComponent: { name: 'cil-task' }
  // },
  // {
  //   name: 'Terms & Conditions',
  //   iconComponent: { name: 'cil-spreadsheet' }
  // },
  // {
  //   name: 'Return Policy',
  //   iconComponent: { name: 'cil-share' }
  // },
  {
    name: 'Contact Us & Support',
    iconComponent: { name: 'cil-language' },
    url: '/contacts',
  },
  {
    title: true,
    name: 'Account'
  },
  {
    name: 'Profile',
    iconComponent: { name: 'cil-language' }
  },
  {
    name: 'Change Password',
    iconComponent: { name: 'cil-language' }
  },
];
