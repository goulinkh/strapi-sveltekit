<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '@canonical/svelte-ds-app-launchpad';
	import type { User } from '$lib/types';

	let user = $state<User | null>(null);
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let request = 0;

	// Runs after hydration and navigation, never while generating static HTML.
	async function refresh() {
		const current = ++request;
		try {
			const response = await fetch('/api/session', { cache: 'no-store' });
			if (!response.ok) throw new Error('Session unavailable');
			const session = (await response.json()) as { user: User | null };
			if (current !== request) return;
			user = session.user;
			status = 'ready';
		} catch {
			if (current !== request) return;
			user = null;
			status = 'error';
		}
	}

	afterNavigate(refresh);
</script>

<svelte:window onfocus={refresh} />

<header class="site-header">
	<div class="container header-inner">
		<div class="header-navigation demo-shared">
			<div class="navigation-content">
				<a class="wordmark" href="/" aria-label="Ubuntu demo home"
					>ubuntu<span class="brand-dot" aria-hidden="true"></span></a
				>
				<nav aria-label="Main navigation">
					{#each [['/desktop', 'Desktop'], ['/catalogue', 'Catalogue'], ['/pro', 'Ubuntu Pro']] as [href, label]}
						<a {href} aria-current={page.url.pathname.startsWith(href) ? 'page' : undefined}
							>{label}</a
						>
					{/each}
				</nav>
			</div>
		</div>
		<div class="header-account demo-dynamic" aria-live="polite" aria-busy={status === 'loading'}>
			{#if user}
				<a href="/pro" class="account-name"
					><span class="avatar" aria-hidden="true">AM</span>{user.name}</a
				>
				<form method="POST" action="/logout">
					<Button type="submit" density="dense">Sign out</Button>
				</form>
			{:else}
				<Button density="dense" href={`/login?next=${encodeURIComponent(page.url.pathname)}`}>
					{status === 'loading'
						? 'Account'
						: status === 'error'
							? 'Account unavailable'
							: 'Sign in'}
				</Button>
			{/if}
		</div>
	</div>
</header>
