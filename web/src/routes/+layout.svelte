<script lang="ts">
	import type { Snippet } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import RenderingGuide from '$lib/components/RenderingGuide.svelte';
	import '../app.css';

	let { children }: { children: Snippet } = $props();
</script>

<a class="skip-link" href="#main">Skip to content</a>
<Header />
<RenderingGuide />
<main id="main" tabindex="-1">
	{@render children()}
</main>
<footer class="site-footer">
	<div class="container footer-inner demo-shared">
		<p>Ubuntu demo · Sample content and a fictional account.</p>
	</div>
</footer>
