<?php
/**
 * Receives the site's two public forms (contact + newsletter) and emails
 * them to the company inbox. Uploaded as-is next to the static build on
 * Hostinger — no database, no Node process, just PHP's built-in mail().
 *
 * Frontend contract: POST with `_form` set to "contact" or "newsletter",
 * plus a hidden honeypot field named "company" that real visitors never
 * fill in (see src/components/contact/contact-content.tsx and
 * src/components/site-footer.tsx). Responds with JSON: {"ok":true} or
 * {"ok":false,"error":"..."}.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

/** Recipient and envelope-from live on the same domain as the site. */
const RECIPIENT = 'contact@sevicesandsupplies24.com';
const FROM_ADDRESS = 'no-reply@sevicesandsupplies24.com';

function respond(bool $ok, ?string $error = null, int $status = 200): void
{
	http_response_code($status);
	echo json_encode($error === null ? ['ok' => $ok] : ['ok' => $ok, 'error' => $error]);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	respond(false, 'Method not allowed', 405);
}

$field = static fn (string $name): string => trim((string) ($_POST[$name] ?? ''));

// Bots fill every field, including hidden ones. A filled honeypot gets a
// fake success so the bot has no reason to retry, and no mail is sent.
if ($field('company') !== '') {
	respond(true);
}

$form = $field('_form') ?: 'contact';

if ($form === 'newsletter') {
	$email = $field('email');

	if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
		respond(false, 'Invalid input', 422);
	}

	$subject = 'Nouvelle inscription newsletter — 24 Services & Supplies';
	$body = "Email : {$email}\n";
	$replyTo = $email;
} else {
	$name = $field('name');
	$email = $field('email');
	$phone = $field('phone');
	$service = $field('service');
	$message = $field('message');

	if ($name === '' || $email === '' || $phone === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
		respond(false, 'Invalid input', 422);
	}

	$subject = 'Nouvelle demande de devis — ' . ($service !== '' ? $service : 'Site web');
	$body = "Nom : {$name}\n"
		. "Email : {$email}\n"
		. "Téléphone : {$phone}\n"
		. 'Service : ' . ($service !== '' ? $service : '—') . "\n\n"
		. "Message :\n{$message}\n";
	$replyTo = "{$name} <{$email}>";
}

$headers = [
	'From: Site 24 Services & Supplies <' . FROM_ADDRESS . '>',
	'Reply-To: ' . $replyTo,
	'Content-Type: text/plain; charset=UTF-8',
];

if (!mail(RECIPIENT, $subject, $body, implode("\r\n", $headers))) {
	respond(false, 'Mail failed', 500);
}

respond(true);
