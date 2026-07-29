<?php

declare(strict_types=1);

final class TemplateSectionExtractor
{
    private const MAX_SECTIONS = 40;
    private const MAX_FIELDS_PER_SECTION = 80;
    private const TEXT_TAGS = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'span', 'a', 'button', 'li', 'blockquote',
        'label', 'strong', 'small',
    ];
    private const SECTION_CLASS_PATTERN =
        '/(?:^|\s)(?:section[-_][a-z0-9_-]+|[a-z0-9_-]+[-_]section|' .
        'hero(?:[-_][a-z0-9_-]+)?|header(?:[-_](?:section|component|wrapper))?|' .
        'footer(?:[-_][a-z0-9_-]+)?|navbar|navigation|' .
        'cta(?:[-_][a-z0-9_-]+)?)(?:\s|$)/i';

    /**
     * @return array{
     *   fingerprint:string,
     *   generated_at:string,
     *   sections:array<int,array<string,mixed>>,
     *   totals:array{sections:int,fields:int,text:int,images:int,links:int}
     * }
     */
    public function extract(string $html): array
    {
        if (trim($html) === '') {
            throw new InvalidArgumentException('Template HTML is empty.', 422);
        }

        $document = $this->loadDocument($html);
        $xpath = new DOMXPath($document);
        $body = $document->getElementsByTagName('body')->item(0);
        if (!$body instanceof DOMElement) {
            throw new RuntimeException('Template HTML has no body element.', 422);
        }

        $candidates = [];
        foreach ($body->getElementsByTagName('*') as $element) {
            if (!$element instanceof DOMElement || !$this->isSectionCandidate($element)) {
                continue;
            }
            if ($this->hasCandidateAncestor($element, $body)) {
                continue;
            }
            $candidates[] = $element;
            if (count($candidates) >= self::MAX_SECTIONS) {
                break;
            }
        }

        if ($candidates === []) {
            foreach ($body->childNodes as $child) {
                if ($child instanceof DOMElement) {
                    $candidates[] = $child;
                }
                if (count($candidates) >= self::MAX_SECTIONS) {
                    break;
                }
            }
        }

        $sections = [];
        $totals = ['sections' => 0, 'fields' => 0, 'text' => 0, 'images' => 0, 'links' => 0];
        foreach ($candidates as $index => $candidate) {
            $fields = $this->extractFields($candidate, $xpath);
            if ($fields === []) {
                continue;
            }
            $path = $this->elementPath($candidate);
            $type = $this->sectionType($candidate, $index);
            $sections[] = [
                'id' => 'section_' . substr(hash('sha256', $path), 0, 16),
                'label' => $this->sectionLabel($candidate, $type, count($sections)),
                'type' => $type,
                'path' => $path,
                'fields' => $fields,
                'field_count' => count($fields),
            ];
            $totals['sections']++;
            foreach ($fields as $field) {
                $totals['fields']++;
                if ($field['kind'] === 'text') {
                    $totals['text']++;
                } elseif (str_starts_with((string) $field['kind'], 'image_')) {
                    $totals['images']++;
                } elseif ($field['kind'] === 'link') {
                    $totals['links']++;
                }
            }
        }

        return [
            'fingerprint' => hash('sha256', $html),
            'generated_at' => gmdate(DATE_ATOM),
            'sections' => $sections,
            'totals' => $totals,
        ];
    }

    public function loadDocument(string $html): DOMDocument
    {
        $previous = libxml_use_internal_errors(true);
        $document = new DOMDocument('1.0', 'UTF-8');
        $loaded = $document->loadHTML(
            '<?xml encoding="utf-8" ?>' . $html,
            LIBXML_NONET | LIBXML_COMPACT
        );
        libxml_clear_errors();
        libxml_use_internal_errors($previous);
        if (!$loaded) {
            throw new RuntimeException('Unable to parse template HTML.', 422);
        }
        foreach ($document->childNodes as $node) {
            if ($node instanceof DOMProcessingInstruction) {
                $document->removeChild($node);
                break;
            }
        }

        return $document;
    }

    /**
     * @return array<int,array<string,mixed>>
     */
    private function extractFields(DOMElement $section, DOMXPath $xpath): array
    {
        $fields = [];
        $elements = [$section];
        foreach ($section->getElementsByTagName('*') as $element) {
            if ($element instanceof DOMElement) {
                $elements[] = $element;
            }
        }

        foreach ($elements as $element) {
            if ($this->isExcluded($element)) {
                continue;
            }
            $tag = strtolower($element->tagName);
            $path = $this->elementPath($element);

            if (
                in_array($tag, self::TEXT_TAGS, true) &&
                !$this->hasElementChildren($element)
            ) {
                $value = trim(preg_replace('/\s+/u', ' ', $element->textContent) ?? '');
                if ($value !== '' && mb_strlen($value) <= 1000) {
                    $fields[] = $this->field(
                        'text',
                        $path,
                        null,
                        $this->fieldLabel($element, 'Text', $value),
                        $value,
                        $tag === 'h1' || $tag === 'h2' ? 240 : 1000
                    );
                }
            }

            if ($tag === 'img') {
                $source = trim($element->getAttribute('src'));
                if ($source !== '') {
                    $fields[] = $this->field(
                        'image_url',
                        $path,
                        'src',
                        $this->fieldLabel($element, 'Image', $source),
                        $source,
                        2048
                    );
                }
                $fields[] = $this->field(
                    'image_alt',
                    $path,
                    'alt',
                    $this->fieldLabel($element, 'Image alt text', ''),
                    $element->getAttribute('alt'),
                    300
                );
            }

            if ($tag === 'a' && $element->hasAttribute('href')) {
                $href = trim($element->getAttribute('href'));
                if ($href !== '' && !$this->isUnsafeExistingLink($href)) {
                    $fields[] = $this->field(
                        'link',
                        $path,
                        'href',
                        $this->fieldLabel($element, 'Link', $href),
                        $href,
                        2048
                    );
                }
            }

            if (count($fields) >= self::MAX_FIELDS_PER_SECTION) {
                break;
            }
        }

        return array_slice($fields, 0, self::MAX_FIELDS_PER_SECTION);
    }

    /**
     * @return array<string,mixed>
     */
    private function field(
        string $kind,
        string $path,
        ?string $attribute,
        string $label,
        string $value,
        int $maxLength
    ): array {
        return [
            'id' => 'field_' . substr(
                hash('sha256', $kind . '|' . ($attribute ?? '') . '|' . $path),
                0,
                20
            ),
            'kind' => $kind,
            'label' => $label,
            'value' => $value,
            'path' => $path,
            'attribute' => $attribute,
            'max_length' => $maxLength,
        ];
    }

    private function isSectionCandidate(DOMElement $element): bool
    {
        $tag = strtolower($element->tagName);
        if (in_array($tag, ['header', 'section', 'footer', 'nav'], true)) {
            return true;
        }

        return preg_match(
            self::SECTION_CLASS_PATTERN,
            trim($element->getAttribute('class'))
        ) === 1;
    }

    private function hasCandidateAncestor(DOMElement $element, DOMElement $body): bool
    {
        $parent = $element->parentNode;
        while ($parent instanceof DOMElement && $parent !== $body) {
            if ($this->isSectionCandidate($parent)) {
                return true;
            }
            $parent = $parent->parentNode;
        }

        return false;
    }

    private function isExcluded(DOMElement $element): bool
    {
        $excluded = ['script', 'style', 'svg', 'noscript', 'template'];
        $node = $element;
        while ($node instanceof DOMElement) {
            if (in_array(strtolower($node->tagName), $excluded, true)) {
                return true;
            }
            if ($node->getAttribute('id') === 'uln-preview-root') {
                return true;
            }
            $node = $node->parentNode;
        }

        return false;
    }

    private function hasElementChildren(DOMElement $element): bool
    {
        foreach ($element->childNodes as $child) {
            if ($child instanceof DOMElement) {
                return true;
            }
        }

        return false;
    }

    private function elementPath(DOMElement $element): string
    {
        $segments = [];
        $node = $element;
        while ($node instanceof DOMElement) {
            $index = 1;
            for ($sibling = $node->previousSibling; $sibling !== null; $sibling = $sibling->previousSibling) {
                if (
                    $sibling instanceof DOMElement &&
                    strtolower($sibling->tagName) === strtolower($node->tagName)
                ) {
                    $index++;
                }
            }
            array_unshift($segments, strtolower($node->tagName) . '[' . $index . ']');
            $node = $node->parentNode;
        }

        return '/' . implode('/', $segments);
    }

    private function sectionType(DOMElement $element, int $index): string
    {
        $haystack = strtolower(
            $element->tagName . ' ' .
            $element->getAttribute('class') . ' ' .
            $element->getAttribute('id')
        );
        foreach (
            [
                'hero', 'header', 'navigation', 'nav', 'about', 'service',
                'feature', 'benefit', 'testimonial', 'pricing', 'faq',
                'contact', 'cta', 'footer',
            ] as $type
        ) {
            if (str_contains($haystack, $type)) {
                return $type === 'nav' ? 'navigation' : $type;
            }
        }

        return $index === 0 ? 'intro' : 'content';
    }

    private function sectionLabel(DOMElement $element, string $type, int $index): string
    {
        foreach (['aria-label', 'data-name', 'id'] as $attribute) {
            $value = trim($element->getAttribute($attribute));
            if ($value !== '') {
                return $this->humanize($value);
            }
        }
        $classes = preg_split('/\s+/', trim($element->getAttribute('class'))) ?: [];
        foreach ($classes as $class) {
            if (
                preg_match('/section|hero|header|footer|cta|about|feature|service|contact|faq/i', $class)
            ) {
                return $this->humanize($class);
            }
        }

        return ucfirst($type) . ' ' . ($index + 1);
    }

    private function fieldLabel(
        DOMElement $element,
        string $fallback,
        string $value
    ): string {
        $class = trim((string) (preg_split('/\s+/', $element->getAttribute('class'))[0] ?? ''));
        if ($class !== '') {
            return $this->humanize($class);
        }
        $text = trim(preg_replace('/\s+/u', ' ', $value) ?? '');
        if ($text !== '' && !preg_match('~^(?:https?:)?//~i', $text)) {
            return mb_strlen($text) > 45 ? mb_substr($text, 0, 42) . '…' : $text;
        }

        return $fallback . ' (' . strtolower($element->tagName) . ')';
    }

    private function humanize(string $value): string
    {
        $value = preg_replace('/[_-]+/', ' ', $value) ?? $value;
        $value = preg_replace('/\s+/', ' ', $value) ?? $value;

        return ucwords(trim($value));
    }

    private function isUnsafeExistingLink(string $href): bool
    {
        return preg_match('/\A(?:javascript|data|vbscript):/i', $href) === 1;
    }
}
