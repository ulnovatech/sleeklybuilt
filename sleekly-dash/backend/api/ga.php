<?php
/**
 * GA4 Data API snapshot for dash Analytics.
 * Requires GA_PROPERTY_ID (numeric property, not G-XXXX / stream id)
 * and a service-account JSON with Viewer on that property.
 */
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../lib/google_credentials.php';

use Google\Analytics\Data\V1beta\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;
use Google\Analytics\Data\V1beta\OrderBy;
use Google\Analytics\Data\V1beta\OrderBy\MetricOrderBy;

function ga_fail(int $status, string $code, string $message): void
{
    http_response_code($status);
    echo json_encode([
        'ok' => false,
        'code' => $code,
        'error' => $message,
    ]);
    exit;
}

function ga_metric_float($row, int $index): float
{
    $values = $row->getMetricValues();
    if (!isset($values[$index])) {
        return 0.0;
    }
    return (float) $values[$index]->getValue();
}

function ga_format_date(string $raw): string
{
    $raw = trim($raw);
    if (preg_match('/^(\d{4})(\d{2})(\d{2})$/', $raw, $m)) {
        return $m[1] . '-' . $m[2] . '-' . $m[3];
    }
    return $raw;
}

function ga_label_date(string $iso): string
{
    $ts = strtotime($iso);
    return $ts ? date('M j', $ts) : $iso;
}

$credentialsPath = sleeklybuilt_google_credentials_path();
if ($credentialsPath === null) {
    ga_fail(503, 'credentials_missing', 'Google Analytics credentials are not on this server yet.');
}

$propertyId = preg_replace('/\D+/', '', (string) (getenv('GA_PROPERTY_ID') ?: ''));
if ($propertyId === '') {
    ga_fail(
        503,
        'property_missing',
        'Set GA_PROPERTY_ID to the numeric GA4 property ID (Admin → Property details). Not the G- measurement ID or stream ID.'
    );
}

putenv('GOOGLE_APPLICATION_CREDENTIALS=' . $credentialsPath);

$property = 'properties/' . $propertyId;
$dateRange = new DateRange(['start_date' => '30daysAgo', 'end_date' => 'today']);

try {
    $client = new BetaAnalyticsDataClient();

    $response = $client->runReport([
        'property' => $property,
        'dateRanges' => [$dateRange],
        'metrics' => [
            new Metric(['name' => 'activeUsers']),
            new Metric(['name' => 'newUsers']),
            new Metric(['name' => 'sessions']),
            new Metric(['name' => 'screenPageViews']),
            new Metric(['name' => 'averageSessionDuration']),
            new Metric(['name' => 'engagedSessions']),
            new Metric(['name' => 'bounceRate']),
        ],
        'dimensions' => [
            new Dimension(['name' => 'date']),
        ],
    ]);

    $series = [];
    foreach ($response->getRows() as $row) {
        $date = ga_format_date($row->getDimensionValues()[0]->getValue());
        $sessions = ga_metric_float($row, 2);
        $bounce = ga_metric_float($row, 6);
        if ($bounce > 0 && $bounce <= 1) {
            $bounce *= 100;
        }
        $series[] = [
            'date' => $date,
            'label' => ga_label_date($date),
            'activeUsers' => (int) round(ga_metric_float($row, 0)),
            'newUsers' => (int) round(ga_metric_float($row, 1)),
            'sessions' => (int) round($sessions),
            'pageViews' => (int) round(ga_metric_float($row, 3)),
            'averageSessionDuration' => ga_metric_float($row, 4),
            'engagedSessions' => (int) round(ga_metric_float($row, 5)),
            'bounceRate' => round($bounce, 1),
        ];
    }

    usort($series, static fn ($a, $b) => strcmp($a['date'], $b['date']));

    $sumUsers = 0;
    $sumNew = 0;
    $sumSessions = 0;
    $sumViews = 0;
    $sumEngaged = 0;
    $weightedDuration = 0.0;
    $weightedBounce = 0.0;
    foreach ($series as $row) {
        $sumUsers += $row['activeUsers'];
        $sumNew += $row['newUsers'];
        $sumSessions += $row['sessions'];
        $sumViews += $row['pageViews'];
        $sumEngaged += $row['engagedSessions'];
        $weight = max($row['sessions'], 1);
        $weightedDuration += $row['averageSessionDuration'] * $weight;
        $weightedBounce += $row['bounceRate'] * $weight;
    }
    $weightTotal = 0;
    foreach ($series as $row) {
        $weightTotal += max($row['sessions'], 1);
    }

    $pages = [];
    try {
        $pageReport = $client->runReport([
            'property' => $property,
            'dateRanges' => [$dateRange],
            'dimensions' => [
                new Dimension(['name' => 'pagePath']),
                new Dimension(['name' => 'pageTitle']),
            ],
            'metrics' => [
                new Metric(['name' => 'screenPageViews']),
            ],
            'orderBys' => [
                new OrderBy([
                    'metric' => new MetricOrderBy(['metric_name' => 'screenPageViews']),
                    'desc' => true,
                ]),
            ],
            'limit' => 8,
        ]);
        foreach ($pageReport->getRows() as $row) {
            $path = $row->getDimensionValues()[0]->getValue();
            $title = $row->getDimensionValues()[1]->getValue();
            if ($path === '' || str_starts_with($path, '/dash') || str_starts_with($path, '/api')) {
                continue;
            }
            $pages[] = [
                'path' => $path,
                'title' => $title !== '(not set)' ? $title : $path,
                'views' => (int) round(ga_metric_float($row, 0)),
            ];
        }
    } catch (Exception $e) {
        $pages = [];
    }

    $events = [];
    try {
        $eventReport = $client->runReport([
            'property' => $property,
            'dateRanges' => [$dateRange],
            'dimensions' => [
                new Dimension(['name' => 'eventName']),
            ],
            'metrics' => [
                new Metric(['name' => 'eventCount']),
            ],
            'orderBys' => [
                new OrderBy([
                    'metric' => new MetricOrderBy(['metric_name' => 'eventCount']),
                    'desc' => true,
                ]),
            ],
            'limit' => 20,
        ]);
        $highlight = ['generate_lead' => 0, 'whatsapp_click' => 0, 'page_view' => 0];
        foreach ($eventReport->getRows() as $row) {
            $name = $row->getDimensionValues()[0]->getValue();
            $count = (int) round(ga_metric_float($row, 0));
            if (array_key_exists($name, $highlight)) {
                $highlight[$name] = $count;
            }
            $events[] = ['name' => $name, 'count' => $count];
        }
    } catch (Exception $e) {
        $highlight = ['generate_lead' => 0, 'whatsapp_click' => 0, 'page_view' => 0];
        $events = [];
    }

    echo json_encode([
        'ok' => true,
        'range' => '30d',
        'propertyId' => $propertyId,
        'totals' => [
            'activeUsers' => $sumUsers,
            'newUsers' => $sumNew,
            'sessions' => $sumSessions,
            'pageViews' => $sumViews,
            'engagedSessions' => $sumEngaged,
            'averageSessionDuration' => $weightTotal ? $weightedDuration / $weightTotal : 0,
            'bounceRate' => $weightTotal ? round($weightedBounce / $weightTotal, 1) : 0,
            'leads' => $highlight['generate_lead'] ?? 0,
            'whatsappClicks' => $highlight['whatsapp_click'] ?? 0,
        ],
        'series' => $series,
        'pages' => $pages,
        'events' => $events,
    ]);
} catch (Exception $e) {
    $debug = getenv('APP_DEBUG') === 'true';
    ga_fail(
        500,
        'ga_request_failed',
        $debug ? $e->getMessage() : 'Could not load Google Analytics. Check that this property granted access to the service account.'
    );
}
