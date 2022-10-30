import http from '@/api/http';

export default (uuid: string, name: string, icon?: string, description?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/settings/rename`, { name, icon, description })
            .then(() => resolve())
            .catch(reject);
    });
};
