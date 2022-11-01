import React, { ChangeEvent, useEffect, useState } from 'react';
import { httpErrorToHuman } from '@/api/http';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import FileObjectRow from '@/components/server/files/FileObjectRow';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { FileObject } from '@/api/server/files/loadDirectory';
import NewDirectoryButton from '@/components/server/files/NewDirectoryButton';
import { NavLink, useLocation } from 'react-router-dom';
import Can from '@/components/elements/Can';
import { ServerError } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { ServerContext } from '@/state/server';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import FileManagerStatus from '@/components/server/files/FileManagerStatus';
import MassActionsBar from '@/components/server/files/MassActionsBar';
import UploadButton from '@/components/server/files/UploadButton';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useStoreActions } from '@/state/hooks';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import { hashToPath } from '@/helpers';
import style from './style.module.css';
import Input from '@/components/elements/Input';

enum SortMethod {
    NameDown,
    NameUp,
    SizeDown,
    SizeUp,
    DateDown,
    DateUp,
}

const sortFiles = (files: FileObject[], method: SortMethod, searchString: string): FileObject[] => {
    let sortedFiles: FileObject[] = files;

    sortedFiles = sortedFiles.sort((a, b) => {
        switch (method) {
            case SortMethod.NameDown: {
                return a.name.localeCompare(b.name);
            }
            case SortMethod.NameUp: {
                return b.name.localeCompare(a.name);
            }
            case SortMethod.DateDown: {
                return b.modifiedAt.valueOf() - a.modifiedAt.valueOf();
            }
            case SortMethod.DateUp: {
                return a.modifiedAt.valueOf() - b.modifiedAt.valueOf();
            }
            case SortMethod.SizeDown: {
                return b.size - a.size;
            }
            case SortMethod.SizeUp: {
                return a.size - b.size;
            }
        }
    });

    sortedFiles = sortedFiles.sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1));
    return sortedFiles
        .filter((file, index) => index === 0 || file.name !== sortedFiles[index - 1].name)
        .filter((file) => file.name.toLowerCase().includes(searchString.toLowerCase()));
};

export default () => {
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);

    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState((state) => state.files.selectedFiles.length);

    const [searchString, setSearchString] = useState('');
    const [sortMethod, setSortMethod] = useState(SortMethod.NameDown);

    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(hashToPath(hash));
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory, sortMethod]);

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.currentTarget.checked ? files?.map((file) => file.name) || [] : []);
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    const searchFiles = (event: ChangeEvent<HTMLInputElement>) => {
        if (files) {
            setSearchString(event.target.value);
            sortFiles(files, searchString);
            mutate();
        }
    };

    return (
        <ServerContentBlock title={'File Manager'} showFlashKey={'files'}>
            <ErrorBoundary>
                <div className={'flex flex-wrap-reverse md:flex-nowrap mb-4'}>
                    <FileManagerBreadcrumbs
                        css={tw`w-full`}
                        renderLeft={
                            <FileActionCheckbox
                                type={'checkbox'}
                                css={tw`mx-4`}
                                checked={selectedFilesLength === (files?.length === 0 ? -1 : files?.length)}
                                onChange={onSelectAllClick}
                            />
                        }
                    />
                    <Input
                        onChange={searchFiles}
                        css={tw`md:mx-6 w-full px-4 mb-4 md:mb-0`}
                        placeholder='Search'
                    ></Input>
                    <Can action={'file.create'}>
                        <div className={style.manager_actions}>
                            <FileManagerStatus />
                            <NewDirectoryButton css={tw`whitespace-nowrap`} />
                            <UploadButton />
                            <NavLink to={`/server/${id}/files/new${window.location.hash}`}>
                                <Button css={tw`whitespace-nowrap h-full`}>New File</Button>
                            </NavLink>
                        </div>
                    </Can>
                </div>
            </ErrorBoundary>
            <div css={tw`w-full flex flex-nowrap text-gray-400`}>
                <button
                    css={tw`ml-20 mb-2 whitespace-nowrap`}
                    onClick={() => {
                        setSortMethod(sortMethod === SortMethod.NameUp ? SortMethod.NameDown : SortMethod.NameUp);
                    }}
                >
                    Name {sortMethod === SortMethod.NameUp ? '↑' : '↓'}
                </button>
                <div css={tw`w-full flex justify-end`}>
                    <button
                        css={tw`mb-2`}
                        style={{ marginRight: '11rem' }}
                        onClick={() => {
                            setSortMethod(sortMethod === SortMethod.SizeUp ? SortMethod.SizeDown : SortMethod.SizeUp);
                        }}
                    >
                        Size {sortMethod === SortMethod.SizeUp ? '↑' : '↓'}
                    </button>
                    <button
                        css={tw`mb-2`}
                        style={{ marginRight: '6rem' }}
                        onClick={() => {
                            setSortMethod(sortMethod === SortMethod.DateUp ? SortMethod.DateDown : SortMethod.DateUp);
                        }}
                    >
                        Date {sortMethod === SortMethod.DateUp ? '↑' : '↓'}
                    </button>
                </div>
            </div>
            {!files ? (
                <Spinner size={'large'} centered />
            ) : (
                <>
                    {!files.length ? (
                        <p css={tw`text-sm text-neutral-400 text-center`}>This directory seems to be empty.</p>
                    ) : (
                        <CSSTransition classNames={'fade'} timeout={150} appear in>
                            <div css={tw`rounded-lg overflow-hidden`}>
                                {files.length > 250 && (
                                    <div css={tw`rounded-lg bg-yellow-400 mb-px p-3`}>
                                        <p css={tw`text-yellow-900 text-sm text-center`}>
                                            This directory is too large to display in the browser, limiting the output
                                            to the first 250 files.
                                        </p>
                                    </div>
                                )}
                                {sortFiles(files.slice(0, 250), sortMethod, searchString).map((file) => (
                                    <FileObjectRow key={file.key} file={file} />
                                ))}
                                <MassActionsBar />
                            </div>
                        </CSSTransition>
                    )}
                </>
            )}
        </ServerContentBlock>
    );
};
