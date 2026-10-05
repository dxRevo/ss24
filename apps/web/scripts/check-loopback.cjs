#!/usr/bin/env node
/**
 * One-shot diagnostic: does this build sandbox allow a Node process to open
 * a TCP server on 127.0.0.1 and connect to itself? That's exactly what
 * react-router's prerender step needs (it starts a preview server, then
 * connects to it over HTTP to render each page) — if this fails, prerender
 * cannot work here no matter how vite.config.ts is tuned.
 *
 * Prints one clear PASS/FAIL line to stdout and always exits 0, so it never
 * blocks the real build — run it as a harmless prefix step to see both this
 * result and the real build's outcome in a single log. Delete this file (and
 * its mention in package.json's "build" script) once the question is settled.
 */
const http = require('node:http');

const TIMEOUT_MS = 5000;
let settled = false;

function finish(message) {
	if (settled) return;
	settled = true;
	console.log(message);
	process.exit(0);
}

const timer = setTimeout(() => finish('[loopback-check] FAIL — timed out waiting for a result'), TIMEOUT_MS);

const server = http.createServer((_req, res) => res.end('ok'));

server.on('error', err => {
	clearTimeout(timer);
	finish(`[loopback-check] FAIL — could not start listening on 127.0.0.1: ${err.code || err.message}`);
});

server.listen(0, '127.0.0.1', () => {
	const { port } = server.address();

	const req = http.get(`http://127.0.0.1:${port}/`, res => {
		res.resume();
		res.on('end', () => {
			clearTimeout(timer);
			server.close();
			finish(`[loopback-check] PASS — connected to 127.0.0.1:${port} (status ${res.statusCode})`);
		});
	});

	req.on('error', err => {
		clearTimeout(timer);
		server.close();
		finish(`[loopback-check] FAIL — could not connect to 127.0.0.1:${port}: ${err.code || err.message}`);
	});
});
