<?php
/**
 * RETIRED — unauthenticated template status dashboard.
 * Use the authenticated CRM (/dash) for catalog operations.
 */
http_response_code(410);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Template dashboard retired</title>
</head>
<body>
  <main>
    <h1>Template dashboard retired</h1>
    <p>Unauthenticated status changes are no longer available. Manage templates in the CRM after signing in.</p>
    <p><a href="/dash/">Open CRM</a></p>
  </main>
</body>
</html>
