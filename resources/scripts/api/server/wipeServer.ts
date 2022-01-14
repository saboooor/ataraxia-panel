import loadDirectory from '@/api/server/files/loadDirectory';
import deleteFiles from '@/api/server/files/deleteFiles';

export default (uuid: string, deleteWorld: boolean, deletePlayerData: boolean): Promise<void> => {
    const directory = '/server/rust';

    return new Promise((resolve, reject) => {
        loadDirectory(uuid, directory).then((files) => {
            const filesToDelete = files.filter(file => {
                if (deleteWorld && (file.name.endsWith('.sav') || file.name.endsWith('.map'))) {
                    return true;
                }

                return deletePlayerData && file.name.startsWith('player.') && (file.name.endsWith('.db') || file.name.endsWith('.db-journal'));
            });
            deleteFiles(uuid, directory, filesToDelete.map(file => file.name))
                .then(resolve)
                .catch(reject);
        }).catch(reject);
    });
};
