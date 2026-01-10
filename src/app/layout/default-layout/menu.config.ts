import { INavData } from '@coreui/angular';

export interface AppNavItem extends INavData {
    permission?: string;
}

export const MENU_ITEMS: AppNavItem[] = [
    {
        name: 'Dashboard',
        url: '/dashboard',
        iconComponent: { name: 'cil-home' },
        permission: 'VIEW_DASHBOARD'
    },
    {
        title: true,
        name: 'User Management',
        permission: 'VIEW_USERS'
    },
    {
        name: 'Users',
        url: '/users',
        iconComponent: { name: 'cil-people' },
        permission: 'VIEW_USERS'
    },
    {
        name: 'Moderators',
        url: '/moderators',
        iconComponent: { name: 'cil-user' },
        permission: 'VIEW_MODERATORS'
    },
    {
        name: 'Roles',
        url: '/roles',
        iconComponent: { name: 'cil-https' },
        permission: 'VIEW_ROLES'
    },
    {
        name: 'Modules & permission',
        url: '/modules',
        iconComponent: { name: 'cil-columns' },
        permission: 'VIEW_MODULES',
    },
    {
        title: true,
        name: 'Contact & Support'
    },
    {
        name: 'Contacts',
        url: '/contacts',
        iconComponent: { name: 'cil-contact' },
        permission: 'VIEW_CONTACTS'
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
