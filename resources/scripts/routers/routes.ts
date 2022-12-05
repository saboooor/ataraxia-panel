import type { ComponentType } from 'react';
import { lazy } from 'react';

import ServerConsole from '@/components/server/console/ServerConsoleContainer';
import DatabasesContainer from '@/components/server/databases/DatabasesContainer';
import ScheduleContainer from '@/components/server/schedules/ScheduleContainer';
import UsersContainer from '@/components/server/users/UsersContainer';
import BackupContainer from '@/components/server/backups/BackupContainer';
import NetworkContainer from '@/components/server/network/NetworkContainer';
import StartupContainer from '@/components/server/startup/StartupContainer';
import FileManagerContainer from '@/components/server/files/FileManagerContainer';
import SettingsContainer from '@/components/server/settings/SettingsContainer';
import AccountOverviewContainer from '@/components/dashboard/AccountOverviewContainer';
import AccountApiContainer from '@/components/dashboard/AccountApiContainer';
import AccountSSHContainer from '@/components/dashboard/ssh/AccountSSHContainer';
import ActivityLogContainer from '@/components/dashboard/activity/ActivityLogContainer';
import ServerActivityLogContainer from '@/components/server/ServerActivityLogContainer';
import {
    faTerminal,
    faFolderOpen,
    faDatabase,
    faCalendarWeek,
    faUsers,
    faUpload,
    faEthernet,
    faPlayCircle,
    faCogs,
    faBook,
} from '@fortawesome/free-solid-svg-icons';

// Each of the router files is already code split out appropriately — so
// all the items above will only be loaded in when that router is loaded.
//
// These specific lazy loaded routes are to avoid loading in heavy screens
// for the server dashboard when they're only needed for specific instances.
const FileEditContainer = lazy(() => import('@/components/server/files/FileEditContainer'));
const ScheduleEditContainer = lazy(() => import('@/components/server/schedules/ScheduleEditContainer'));

interface RouteDefinition {
    /**
     * Route is the path that will be matched against, this field supports wildcards.
     */
    route: string;
    /**
     * Path is the path that will be used for any navbars or links, do not use wildcards or fancy
     * matchers here. If this field is left undefined, this route will not have a navigation element,
     */
    path?: string;
    // If undefined is passed this route is still rendered into the router itself
    // but no navigation link is displayed in the sub-navigation menu.
    name: string | undefined;
    component: ComponentType;
    end?: boolean;
}

interface ServerRouteDefinition extends RouteDefinition {
    permission?: string | string[];
    icon: any;
}

interface Routes {
    // All the routes available under "/account"
    account: RouteDefinition[];
    // All the routes available under "/server/:id"
    server: ServerRouteDefinition[];
}

export default {
    account: [
        {
            route: '',
            path: '',
            name: 'Account',
            component: AccountOverviewContainer,
            end: true,
        },
        {
            route: 'api',
            path: 'api',
            name: 'API Credentials',
            component: AccountApiContainer,
        },
        {
            route: 'ssh',
            path: 'ssh',
            name: 'SSH Keys',
            component: AccountSSHContainer,
        },
        {
            route: 'activity',
            path: 'activity',
            name: 'Activity',
            component: ActivityLogContainer,
        },
    ],
    server: [
        {
            route: '',
            path: '',
            permission: null,
            name: 'Console',
            icon: faTerminal,
            component: ServerConsole,
            end: true,
        },
        {
            route: 'files/*',
            path: 'files',
            permission: 'file.*',
            name: 'Files',
            icon: faFolderOpen,
            component: FileManagerContainer,
        },
        {
            route: 'files/edit/*',
            permission: 'file.*',
            name: undefined,
            component: FileEditContainer,
        },
        {
            route: 'files/new/*',
            permission: 'file.*',
            name: undefined,
            component: FileEditContainer,
        },
        {
            route: 'databases/*',
            path: 'databases',
            permission: 'database.*',
            name: 'Databases',
            icon: faDatabase,
            component: DatabasesContainer,
        },
        {
            route: 'schedules/*',
            path: 'schedules',
            permission: 'schedule.*',
            name: 'Schedules',
            icon: faCalendarWeek,
            component: ScheduleContainer,
        },
        {
            route: 'schedules/:id/*',
            permission: 'schedule.*',
            name: undefined,
            component: ScheduleEditContainer,
        },
        {
            route: 'users/*',
            path: 'users',
            permission: 'user.*',
            name: 'Users',
            icon: faUsers,
            component: UsersContainer,
        },
        {
            route: 'backups/*',
            path: 'backups',
            permission: 'backup.*',
            name: 'Backups',
            icon: faUpload,
            component: BackupContainer,
        },
        {
            route: 'network/*',
            path: 'network',
            permission: 'allocation.*',
            name: 'Network',
            icon: faEthernet,
            component: NetworkContainer,
        },
        {
            route: 'startup/*',
            path: 'startup',
            permission: 'startup.*',
            name: 'Startup',
            icon: faPlayCircle,
            component: StartupContainer,
        },
        {
            route: 'settings/*',
            path: 'settings',
            permission: ['settings.*', 'file.sftp'],
            name: 'Settings',
            icon: faCogs,
            component: SettingsContainer,
        },
        {
            route: 'activity/*',
            path: 'activity',
            permission: 'activity.*',
            name: 'Activity',
            icon: faBook,
            component: ServerActivityLogContainer,
        },
    ],
} as Routes;
