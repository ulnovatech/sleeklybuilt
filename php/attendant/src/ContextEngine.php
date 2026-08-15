<?php

declare(strict_types=1);

namespace Attendant;

/**
 * Builds structured turn context for PromptComposer placeholders.
 * Knowledge retrieval is empty until 1C wires the corpus.
 */
final class ContextEngine
{
    /**
     * @param array<string,mixed> $page
     * @param array<string,mixed>|null $draft
     * @param array<string,mixed>|null $pending
     * @param list<array{id:string,title?:string,text?:string,source?:string}> $retrieved
     * @return array{
     *   page_json:string,
     *   visible_json:string,
     *   draft_json:string,
     *   pending_json:string,
     *   company_json:string,
     *   retrieved_json:string,
     *   retrieved_ids:list<string>
     * }
     */
    public function build(array $page, ?array $draft, ?array $pending, array $retrieved = []): array
    {
        $visible = [
            'visible_product_id' => $page['visible_product_id'] ?? null,
            'visible_product_kind' => $page['visible_product_kind'] ?? null,
            'visible_service_id' => $page['visible_service_id'] ?? null,
        ];

        $ids = [];
        foreach ($retrieved as $hit) {
            if (isset($hit['id'])) {
                $ids[] = (string) $hit['id'];
            }
        }

        return [
            'page_json' => $this->encode([
                'current_url' => $page['current_url'] ?? '',
                'page_id' => $page['page_id'] ?? 'unknown',
                'section_id' => $page['section_id'] ?? null,
                'path' => $page['path'] ?? null,
                'recent_page_ids' => $page['recent_page_ids'] ?? [],
            ]),
            'visible_json' => $this->encode($visible),
            'draft_json' => $this->encode($draft ?? new \stdClass()),
            'pending_json' => $this->encode($pending === null ? null : [
                'tool' => $pending['tool_name'] ?? $pending['tool'] ?? null,
                'summary' => $pending['summary'] ?? $pending['summary_text'] ?? null,
                'waiting' => true,
            ]),
            'company_json' => $this->encode($this->companyRecord()),
            'retrieved_json' => $this->encode($retrieved),
            'retrieved_ids' => $ids,
        ];
    }

    /**
     * Fallback company facts aligned with marketing/src/site.config.js.
     * 1C may replace with live site-contact when available.
     *
     * @return array<string,mixed>
     */
    public function companyRecord(): array
    {
        return [
            'brand_name' => 'SleeklyBuilt',
            'legal_name' => 'SleeklyBuilt',
            'tagline' => 'Websites, apps & systems — built sleek, built right',
            'description' =>
                'SleeklyBuilt crafts custom websites, mobile apps, graphics, and business systems for clients in Uganda and beyond.',
            'email' => 'sales@sleeklybuilt.pro',
            'phones' => ['+256 791779448', '+256 749594464', '+256 772169960'],
            'primary_phone' => '+256791779448',
            'whatsapp_url' => 'https://wa.me/256749594464',
            'location' => 'Kampala, Uganda',
            'address_note' => 'Office under development',
            'social' => [
                'x' => 'https://x.com/sleeklybuilt',
                'instagram' => 'https://www.instagram.com/sleeklybuilt/?hl=en',
                'linkedin' => 'https://www.linkedin.com/company/sleeklybuilt/',
                'youtube' => 'https://www.youtube.com/@SleeklyBuilt',
            ],
        ];
    }

    private function encode(mixed $value): string
    {
        $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return $json === false ? '{}' : $json;
    }
}
