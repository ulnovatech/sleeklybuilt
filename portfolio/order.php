<?php
/**
 * RETIRED legacy HTML order form.
 * Paid checkout lives in the portfolio SPA; quote-only uses /portfolio/api/quote.php.
 */
http_response_code(410);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
$checkout = '/portfolio-app/order';
$template = isset($_GET['template']) ? rawurlencode((string) $_GET['template']) : '';
if ($template !== '') {
    $checkout .= '?template=' . $template;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Order form retired</title>
  <meta http-equiv="refresh" content="0;url=<?= htmlspecialchars($checkout, ENT_QUOTES, 'UTF-8') ?>">
</head>
<body>
  <main>
    <h1>This order form is retired</h1>
    <p>Templates are reserved only after a verified deposit.</p>
    <p><a href="<?= htmlspecialchars($checkout, ENT_QUOTES, 'UTF-8') ?>">Continue to checkout</a></p>
  </main>
</body>
</html>
