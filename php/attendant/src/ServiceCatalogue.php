<?php

declare(strict_types=1);

namespace Attendant;

final class ServiceCatalogue
{
    /** @var array<string, array<string,mixed>> */
    private array $services = [];

    /** @var array<string, array{canonical_id:string,hint?:array}> */
    private array $aliases = [];

    public function __construct(?string $knowledgeDir = null)
    {
        $dir = $knowledgeDir ?? (__DIR__ . '/../knowledge');
        $raw = json_decode((string) file_get_contents($dir . DIRECTORY_SEPARATOR . 'services.json'), true);
        foreach (($raw['services'] ?? []) as $svc) {
            if (is_array($svc) && isset($svc['id'])) {
                $this->services[(string) $svc['id']] = $svc;
            }
        }
        foreach (($raw['aliases'] ?? []) as $alias => $meta) {
            if (is_array($meta) && isset($meta['canonical_id'])) {
                $this->aliases[(string) $alias] = $meta;
            }
        }
    }

    /**
     * @return array{ok:bool,service?:array,code?:string,error?:string}
     */
    public function getService(string $id): array
    {
        $id = trim($id);
        if ($id === '') {
            return ['ok' => false, 'code' => 'validation_error', 'error' => 'Service id required'];
        }

        $hint = null;
        $canonical = $id;
        if (isset($this->aliases[$id])) {
            $canonical = (string) $this->aliases[$id]['canonical_id'];
            $hint = $this->aliases[$id]['hint'] ?? null;
        }

        if (!isset($this->services[$canonical])) {
            return ['ok' => false, 'code' => 'not_found', 'error' => 'Service not found'];
        }

        $svc = $this->services[$canonical];
        $out = [
            'id' => $canonical,
            'label' => (string) ($svc['label'] ?? $canonical),
            'tagline' => (string) ($svc['tagline'] ?? ''),
            'href' => (string) ($svc['href'] ?? ''),
            'page_id' => (string) ($svc['page_id'] ?? $canonical),
            'keywords' => $svc['keywords'] ?? [],
            'faq_ids' => $svc['faq_ids'] ?? [],
            'order_path' => (string) ($svc['order_path'] ?? 'capture_lead'),
        ];
        if ($id !== $canonical) {
            $out['canonical_id'] = $canonical;
            $out['requested_id'] = $id;
        }
        if (is_array($hint)) {
            $out['hint'] = $hint;
        }
        return ['ok' => true, 'service' => $out];
    }
}
