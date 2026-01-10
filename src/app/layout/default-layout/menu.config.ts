import { INavData } from '@coreui/angular';

export interface AppNavItem extends INavData {
    permissions?: string[];
}

export const MENU_ITEMS: AppNavItem[] = [
    {
        name: 'Dashboard',
        url: '/dashboard',
        iconComponent: { name: 'cil-home' },
        permissions: ['VIEW_DASHBOARD']
    },
    {
        title: true,
        name: 'User Management',
        permissions: ['VIEW_USERS']
    },
    {
        name: 'Users',
        url: '/users',
        iconComponent: { name: 'cil-people' },
        permissions: ['VIEW_USERS']
    },
    {
        name: 'Moderators',
        url: '/moderators',
        iconComponent: { name: 'cil-user' },
        permissions: ['VIEW_MODERATORS']
    },
    {
        name: 'Roles',
        url: '/roles',
        iconComponent: { name: 'cil-https' },
        permissions: ['VIEW_ROLES']
    },
    {
        name: 'Modules & Permissions',
        url: '/modules',
        iconComponent: { name: 'cil-columns' },
        permissions: ['VIEW_MODULES', 'VIEW_PERMISSIONS']
    },
    {
        title: true,
        name: 'Contact & Support'
    },
    {
        name: 'Contacts',
        url: '/contacts',
        iconComponent: { name: 'cil-contact' },
        permissions: ['VIEW_CONTACTS']
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
