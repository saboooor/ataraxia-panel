<?php

namespace Pterodactyl\Http\ViewComposers;

use Illuminate\View\View;

class AssetComposer
{
    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {
        $view->with('siteConfiguration', [
            'name' => config('app.name') ?? 'Pterodactyl',
            'icon' => config('app.icon') ?? 'https://raw.githubusercontent.com/saboooor/Nether-Depths/main/Branding/nd.png',
            'logo' => config('app.logo') ?? 'https://raw.githubusercontent.com/saboooor/Nether-Depths/main/Branding/netherdepths.png',
            'locale' => config('app.locale') ?? 'en',
            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],
        ]);
    }
}
