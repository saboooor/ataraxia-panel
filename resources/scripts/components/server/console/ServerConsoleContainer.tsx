import { memo } from 'react';
import isEqual from 'react-fast-compare';

import { Alert } from '@/components/elements/alert';
import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import Console from '@/components/server/console/Console';
import PowerButtons from '@/components/server/console/PowerButtons';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import StatGraphs from '@/components/server/console/StatGraphs';
import Features from '@feature/Features';
import { ServerContext } from '@/state/server';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

function ServerConsoleContainer() {
    const name = ServerContext.useStoreState(state => state.server.data!.name);
    const icon = ServerContext.useStoreState(state => state.server.data!.icon);
    const description = ServerContext.useStoreState(state => state.server.data!.description);
    const isInstalling = ServerContext.useStoreState(state => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState(state => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState(state => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState(state => state.server.data!.isNodeUnderMaintenance);
    const isSuspended = ServerContext.useStoreState(state => state.server.data!.status === 'suspended');

    if (new URLSearchParams(window.location.search).get('popup')) return <Console popup={true} />;

    return (
        <ServerContentBlock title={'Console'}>
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {isNodeUnderMaintenance
                        ? 'The node of this server is currently under maintenance and all actions are unavailable.'
                        : isInstalling
                        ? 'This server is currently running its installation process and most actions are unavailable.'
                        : 'This server is currently being transferred to another node and all actions are unavailable.'}
                </Alert>
            )}
            {isSuspended && (
                <Alert type={'danger'} className={'mb-4'}>
                    This server is currently suspended.
                </Alert>
            )}
            <div className={'grid grid-cols-4 gap-4 mb-4'}>
                <div className={'flex col-span-4 sm:col-span-2 lg:col-span-3 pr-4 items-center'}>
                    {!!icon && (
                        <img
                            src={icon}
                            className={'mx-5'}
                            style={{
                                minHeight: '50px',
                                height: '50px',
                                minWidth: '50px',
                                width: '50px',
                                borderRadius: '5px',
                            }}
                        />
                    )}
                    <div className={'block'}>
                        <h1 className={'font-header text-2xl text-gray-50 leading-relaxed line-clamp-1'}>{name}</h1>
                        <p className={'text-sm line-clamp-2'}>{description}</p>
                    </div>
                </div>
                <div className={'col-span-4 sm:col-span-2 lg:col-span-1 self-end'}>
                    {!isSuspended && (
                        <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                            <PowerButtons className={'flex sm:justify-end space-x-2'} />
                        </Can>
                    )}
                </div>
            </div>
            <div className={'grid grid-cols-4 gap-2 sm:gap-4 mb-4'}>
                <div className={'flex col-span-4 lg:col-span-3'}>
                    <Spinner.Suspense>
                        <Console popup={false} />
                    </Spinner.Suspense>
                </div>
                <ServerDetailsBlock className={'col-span-4 lg:col-span-1 order-last lg:order-none'} />
            </div>
            <div className={'grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4'}>
                <Spinner.Suspense>
                    <StatGraphs />
                </Spinner.Suspense>
            </div>
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
}

export default memo(ServerConsoleContainer, isEqual);
