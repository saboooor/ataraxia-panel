<?php

namespace Pterodactyl\Jobs\Schedule;

use Exception;
use Illuminate\Support\Str;
use Pterodactyl\Jobs\Job;
use Carbon\CarbonImmutable;
use Pterodactyl\Models\Task;
use InvalidArgumentException;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Pterodactyl\Repositories\Eloquent\ServerVariableRepository;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Services\Backups\InitiateBackupService;
use Pterodactyl\Repositories\Wings\DaemonPowerRepository;
use Pterodactyl\Repositories\Wings\DaemonCommandRepository;
use Pterodactyl\Exceptions\Http\Connection\DaemonConnectionException;
use Pterodactyl\Services\Files\DeleteFilesService;

class RunTaskJob extends Job implements ShouldQueue
{
    use DispatchesJobs;
    use InteractsWithQueue;
    use SerializesModels;

    /**
     * RunTaskJob constructor.
     */
    public function __construct(public Task $task, public bool $manualRun = false)
    {
        $this->queue = 'standard';
    }

    /**
     * Run the job and send actions to the daemon running the server.
     *
     * @throws \Throwable
     */
    public function handle(
        DaemonCommandRepository $commandRepository,
        InitiateBackupService $backupService,
        DaemonPowerRepository $powerRepository,
        DaemonFileRepository $fileRepository,
        ServerVariableRepository $variableRepository,
        DeleteFilesService $filesService
    ) {
        // Do not process a task that is not set to active, unless it's been manually triggered.
        if (!$this->task->schedule->is_active && !$this->manualRun) {
            $this->markTaskNotQueued();
            $this->markScheduleComplete();

            return;
        }

        $server = $this->task->server;
        // If we made it to this point and the server status is not null it means the
        // server was likely suspended or marked as reinstalling after the schedule
        // was queued up. Just end the task right now — this should be a very rare
        // condition.
        if (!is_null($server->status)) {
            $this->failed();

            return;
        }

        // Perform the provided task against the daemon.
        try {
            switch ($this->task->action) {
                case Task::ACTION_POWER:
                    $powerRepository->setServer($server)->send($this->task->payload);
                    break;
                case Task::ACTION_COMMAND:
                    $commandRepository->setServer($server)->send($this->task->payload);
                    break;
                case Task::ACTION_BACKUP:
                    $backupService->setIgnoredFiles(explode(PHP_EOL, $this->task->payload))->handle($server, null, true);
                    break;
                case Task::ACTION_WIPE:
                    if (in_array('rust_wipe', $server->egg->features)) {
                        $filesToDelete = collect([]);
                        collect($fileRepository->setServer($server)->getDirectory('/server/rust'))->each(function ($item, $key) use ($filesToDelete) {
                            if (($this->task->payload == 'world' || $this->task->payload == 'both') && Str::endsWith($item['name'], ['.sav', '.sav.1', '.sav.2', '.map'])) {
                                $filesToDelete->push($item['name']);
                            }

                            if (($this->task->payload == 'player' || $this->task->payload == 'both') && Str::startsWith($item['name'], 'player.') && Str::endsWith($item['name'], ['.db', '.db-journal'])) {
                                $filesToDelete->push($item['name']);
                            }
                        });
                        if ($filesToDelete->isNotEmpty()) {
                            $fileRepository->setServer($server)->deleteFiles('/server/rust', $filesToDelete->toArray());
                        }

                        if ($this->task->payload == 'world' || $this->task->payload == 'both') {
                            /** @var \Pterodactyl\Models\EggVariable $variable */
                            $variable = $server->variables()->where('env_variable', 'WORLD_SEED')->first();
                            if ($variable) {
                                $newSeed = strval(mt_rand(132132, 132132132));

                                $variableRepository->updateOrCreate([
                                    'server_id' => $server->id,
                                    'variable_id' => $variable->id,
                                ], [
                                    'variable_value' => $newSeed,
                                ]);

                                $variable = $variable->refresh();
                                $variable->server_value = $newSeed;
                            }
                        }
                    }
                    break;
                case Task::ACTION_DELETE_FILES:
                    $filesService->deleteFiles($server, explode(PHP_EOL, $this->task->payload));
                    break;
                default:
                    throw new InvalidArgumentException('Invalid task action provided: ' . $this->task->action);
            }
        } catch (Exception $exception) {
            // If this isn't a DaemonConnectionException on a task that allows for failures
            // throw the exception back up the chain so that the task is stopped.
            if (!($this->task->continue_on_failure && $exception instanceof DaemonConnectionException)) {
                throw $exception;
            }
        }

        $this->markTaskNotQueued();
        $this->queueNextTask();
    }

    /**
     * Handle a failure while sending the action to the daemon or otherwise processing the job.
     */
    public function failed(Exception $exception = null)
    {
        $this->markTaskNotQueued();
        $this->markScheduleComplete();
    }

    /**
     * Get the next task in the schedule and queue it for running after the defined period of wait time.
     */
    private function queueNextTask()
    {
        /** @var \Pterodactyl\Models\Task|null $nextTask */
        $nextTask = Task::query()->where('schedule_id', $this->task->schedule_id)
            ->orderBy('sequence_id', 'asc')
            ->where('sequence_id', '>', $this->task->sequence_id)
            ->first();

        if (is_null($nextTask)) {
            $this->markScheduleComplete();

            return;
        }

        $nextTask->update(['is_queued' => true]);

        $this->dispatch((new self($nextTask, $this->manualRun))->delay($nextTask->time_offset));
    }

    /**
     * Marks the parent schedule as being complete.
     */
    private function markScheduleComplete()
    {
        $this->task->schedule()->update([
            'is_processing' => false,
            'last_run_at' => CarbonImmutable::now()->toDateTimeString(),
        ]);
    }

    /**
     * Mark a specific task as no longer being queued.
     */
    private function markTaskNotQueued()
    {
        $this->task->update(['is_queued' => false]);
    }
}
