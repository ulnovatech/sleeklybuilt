<?php

declare(strict_types=1);

namespace Attendant\Tools;

use Attendant\AttendantTool;
use Attendant\ServiceCatalogue;
use Attendant\ToolContext;
use Attendant\ToolResults;

final class GetServiceTool implements AttendantTool
{
    public function __construct(private ServiceCatalogue $catalogue)
    {
    }

    public function name(): string
    {
        return 'get_service';
    }

    public function declaration(): array
    {
        return [
            'name' => $this->name(),
            'description' => 'Fetch a service line: sleek-pages, websites, mobile-apps, business-systems.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'id' => ['type' => 'string'],
                ],
                'required' => ['id'],
            ],
        ];
    }

    public function execute(array $args, ToolContext $ctx): array
    {
        $id = trim((string) ($args['id'] ?? ''));
        $result = $this->catalogue->getService($id);
        if (!$result['ok']) {
            return ToolResults::fail(
                $this->name(),
                (string) ($result['code'] ?? 'not_found'),
                'I could not find that service line.'
            );
        }
        return ToolResults::ok($this->name(), $result['service']);
    }
}
