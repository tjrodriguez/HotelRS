import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const mountNode = document.getElementById('app');

function App() {
	const [status, setStatus] = useState({
		message: 'Loading backend status...',
		app_name: mountNode?.dataset.appName ?? 'Laravel React Mix',
		laravel_version: mountNode?.dataset.appVersion ?? '',
		php_version: '',
		timestamp: '',
	});

	useEffect(() => {
		const controller = new AbortController();

		fetch(mountNode?.dataset.apiEndpoint ?? '/api/status', {
			headers: {
				Accept: 'application/json',
			},
			signal: controller.signal,
		})
			.then((response) => response.json())
			.then((payload) => setStatus(payload))
			.catch(() => {
				setStatus((current) => ({
					...current,
					message: 'The backend is reachable, but the status payload could not be loaded.',
				}));
			});

		return () => controller.abort();
	}, []);

	return (
		<div className="page-shell">
			<main className="app-frame">
				<section className="hero-card">
					<div className="eyebrow">Full-stack starter</div>
					<h1>{status.app_name}</h1>
					<p className="hero-copy">
						Laravel handles the backend API while React renders the interface through a Laravel Mix build pipeline.
					</p>
					<div className="hero-grid">
						<article className="feature-card">
							<span className="feature-label">Backend</span>
							<strong>{status.message}</strong>
						</article>
						<article className="feature-card">
							<span className="feature-label">Framework</span>
							<strong>Laravel {status.laravel_version || 'ready'}</strong>
						</article>
						<article className="feature-card">
							<span className="feature-label">Runtime</span>
							<strong>PHP {status.php_version || 'available'}</strong>
						</article>
						<article className="feature-card">
							<span className="feature-label">Updated</span>
							<strong>{status.timestamp ? new Date(status.timestamp).toLocaleString() : 'Waiting for API response'}</strong>
						</article>
					</div>
				</section>

				<section className="stack-card">
					<div>
						<span className="feature-label">Pipeline</span>
						<h2>Laravel Mix + React</h2>
					</div>
					<p>
						Source code lives in <code>resources/js</code> and <code>resources/css</code>, with Mix compiling them into versioned assets under <code>public</code>.
					</p>
				</section>
			</main>
		</div>
	);
}

if (mountNode) {
	createRoot(mountNode).render(<App />);
}
