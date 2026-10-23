<script lang="ts">
	import { Button } from '@canonical/svelte-ds-app-launchpad';
	import ContentBody from '$lib/components/ContentBody.svelte';
	import RenderNote from '$lib/components/RenderNote.svelte';
	import type { ContentPage } from '$lib/types';
	let { content, builtAt }: { content: ContentPage; builtAt: string } = $props();
</script>

<svelte:head>
	<title>{content.title} · Ubuntu demo</title>
	<meta name="description" content={content.description} />
</svelte:head>

<article class="container page-content demo-static">
	<header class="page-hero">
		<div>
			<p class="eyebrow">{content.category?.title ?? 'Ubuntu'}</p>
			<h1>{content.title}</h1>
		</div>
		<div class="page-summary">
			<p class="lede">{content.description}</p>
			<div class="actions"><Button href="/catalogue">Page catalogue</Button></div>
		</div>
	</header>
	<ContentBody body={content.body} />
	<div class="actions">
		<Button href="/pro" severity="positive">Open your Pro dashboard</Button>
	</div>
	<RenderNote {builtAt} />
</article>
