<?php

namespace Pterodactyl\Services\Files;

use Illuminate\Support\Str;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;

class DeleteFilesService
{
    /**
     * @var \Pterodactyl\Repositories\Wings\DaemonFileRepository
     */
    private $daemonFileRepository;

    /**
     * DeleteFilesService constructor.
     */
    public function __construct(DaemonFileRepository $daemonFileRepository) {
        $this->daemonFileRepository = $daemonFileRepository;
    }

    /**
     * Deletes all whitelisted files.
     *
     * @throws \Throwable
     */
    public function deleteFiles(Server $server, array $fileWhitelist)
    {
        $filesToDelete = collect([]);
        foreach ($fileWhitelist as $line) {
            $path = dirname($line);
            $pattern = basename($line);
            collect($this->daemonFileRepository->setServer($server)->getDirectory($path))->each(function ($item) use ($path, $pattern, $filesToDelete) {
                if (Str::is($pattern, $item['name'])) {
                    $filesToDelete->push($path . '/' . $item['name']);
                }
            });
        }
        if ($filesToDelete->isNotEmpty()) {
            $this->daemonFileRepository->setServer($server)->deleteFiles('/', $filesToDelete->toArray());
        }
    }
}
