<?php

declare(strict_types=1);

use Attendant\ProductCatalogue;
use Attendant\ServiceCatalogue;
use Attendant\SkillActivator;

fwrite(STDOUT, "\n[catalogue + skills]\n");

$products = new ProductCatalogue();
$orderable = $products->orderableIds();
sort($orderable);
AttendantTest::assertSame(['basic', 'premium', 'smart'], $orderable, 'orderable ids only basic/smart/premium');

$smart = $products->getProduct('smart', 'orderable_package');
AttendantTest::assertTrue(($smart['ok'] ?? false) && ($smart['product']['orderable'] ?? false), 'smart is orderable');

$starter = $products->getProduct('starter', 'display_package');
AttendantTest::assertTrue(($starter['ok'] ?? false) && ($starter['product']['orderable'] ?? true) === false, 'starter display not orderable');

$services = new ServiceCatalogue();
$web = $services->getService('websites');
AttendantTest::assertTrue($web['ok'] ?? false, 'get_service websites');
$alias = $services->getService('restaurant_websites');
AttendantTest::assertTrue(($alias['ok'] ?? false) && ($alias['service']['canonical_id'] ?? '') === 'websites', 'restaurant alias → websites');
$missing = $services->getService('telepathy-systems');
AttendantTest::assertTrue(!($missing['ok'] ?? true), 'unknown service fails');

$activator = new SkillActivator();
$navSkills = $activator->activate('take me to pricing', ['page_id' => 'home']);
AttendantTest::assertTrue(in_array('navigate_site', $navSkills, true), 'navigate skill on show-me intent');
$tools = $activator->allowedTools($navSkills);
AttendantTest::assertTrue(in_array('navigate_to', $tools, true), 'navigate_to allowed');
AttendantTest::assertTrue(!in_array('list_products', $tools, true), 'list_products not in allow-list');
