<?php

declare(strict_types=1);

namespace Attendant;

use Attendant\Tools\CaptureLeadTool;
use Attendant\Tools\CompareProductsTool;
use Attendant\Tools\GetCompanyDocumentTool;
use Attendant\Tools\GetCurrentPageTool;
use Attendant\Tools\GetOrderStatusTool;
use Attendant\Tools\GetProductTool;
use Attendant\Tools\GetServiceTool;
use Attendant\Tools\HandoffTool;
use Attendant\Tools\NavigateToTool;
use Attendant\Tools\PresentChoicesTool;
use Attendant\Tools\SearchKnowledgeTool;
use Attendant\Tools\ShowSectionTool;
use Attendant\Tools\StartOrderTool;
use Attendant\Tools\UpdateCustomerModelTool;

/**
 * Dispatches allow-listed tools. Unknown names fail closed. Never simulates success.
 */
final class ToolRouter
{
    /** @var array<string, AttendantTool> */
    private array $tools = [];

    private SchemaValidator $validator;
    private ConfirmationGate $gate;
    private \PDO $pdo;
    private ?Telemetry $telemetry = null;

    public function __construct(
        ConfirmationGate $gate,
        \PDO $pdo,
        ?SchemaValidator $validator = null,
        ?PageRegistry $pages = null,
        ?KnowledgeCorpus $corpus = null,
        ?ProductCatalogue $products = null,
        ?ServiceCatalogue $services = null,
        ?ContextEngine $context = null,
        ?CompanyDocumentStore $company = null,
        ?ConversationStore $conversations = null,
        ?Telemetry $telemetry = null
    ) {
        $this->gate = $gate;
        $this->pdo = $pdo;
        $this->telemetry = $telemetry ?? new Telemetry($pdo);
        $this->validator = $validator ?? new SchemaValidator();
        $pages ??= new PageRegistry();
        $corpus ??= new KnowledgeCorpus();
        $company ??= new CompanyDocumentStore();
        $products ??= new ProductCatalogue();
        $services ??= new ServiceCatalogue();
        $context ??= new ContextEngine();
        $conversations ??= new ConversationStore($pdo);
        $choiceGate = new ChoiceGate($pdo);

        $this->register(new GetCurrentPageTool());
        $this->register(new NavigateToTool($pages));
        $this->register(new ShowSectionTool($pages));
        $this->register(new SearchKnowledgeTool($corpus, $company));
        $this->register(new GetCompanyDocumentTool($company));
        $this->register(new GetProductTool($products));
        $this->register(new CompareProductsTool($products));
        $this->register(new GetServiceTool($services));
        $this->register(new CaptureLeadTool());
        $this->register(new StartOrderTool($products));
        $this->register(new GetOrderStatusTool());
        $this->register(new HandoffTool($context, $conversations));
        $this->register(new UpdateCustomerModelTool($conversations));
        $this->register(new PresentChoicesTool($choiceGate));
    }

    private function register(AttendantTool $tool): void
    {
        $this->tools[$tool->name()] = $tool;
    }

    /**
     * @return list<string>
     */
    public function registeredTools(): array
    {
        return array_keys($this->tools);
    }

    /**
     * Gemini functionDeclarations for the given allow-list (intersection with registered).
     *
     * @param list<string> $allowed
     * @return list<array<string,mixed>>
     */
    public function declarations(array $allowed): array
    {
        $out = [];
        foreach ($allowed as $name) {
            if (!isset($this->tools[$name])) {
                continue;
            }
            $out[] = $this->tools[$name]->declaration();
        }
        return $out;
    }

    /**
     * @param array<string,mixed> $args
     * @param array<string,mixed> $page
     * @return array<string,mixed>
     */
    public function execute(
        string $toolName,
        array $args,
        string $conversationId,
        array $page = [],
        bool $confirmed = false
    ): array {
        if (!isset($this->tools[$toolName])) {
            return $this->validated(ToolResults::fail(
                $toolName,
                'unsupported',
                'That action is not available.'
            ));
        }

        // Defense in depth: write tools from chat path must go through ConfirmationGate
        if (!$confirmed && $this->gate->requiresConfirmation($toolName)) {
            // Still call the tool — CaptureLead/StartOrder create pending via gate
        }

        $ctx = new ToolContext(
            $conversationId,
            $page,
            $confirmed,
            $this->gate,
            $this->pdo,
            $this->telemetry
        );

        try {
            $result = $this->tools[$toolName]->execute($args, $ctx);
        } catch (\Throwable $e) {
            $result = ToolResults::fail(
                $toolName,
                'backend_error',
                'I couldn\'t complete that just now.'
            );
        }

        return $this->validated($result);
    }

    /**
     * @param array<string,mixed> $result
     * @return array<string,mixed>
     */
    private function validated(array $result): array
    {
        $check = $this->validator->validateToolResult($result);
        if (!$check['ok']) {
            return ToolResults::fail(
                (string) ($result['tool'] ?? 'unknown'),
                'backend_error',
                'I couldn\'t complete that just now.'
            );
        }
        return $result;
    }
}
