<script lang="ts">
	import { Button } from '@canonical/svelte-ds-app-launchpad';
	import RenderNote from '$lib/components/RenderNote.svelte';
	import ContentBody from '$lib/components/ContentBody.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head
	><title>{data.post.title} · Ubuntu demo</title><meta
		name="description"
		content={data.post.description}
	/></svelte:head
>
<article class="container page-content demo-static">
	<header class="page-hero">
		<div>
			<p class="eyebrow">{data.post.category}</p>
			<h1>{data.post.title}</h1>
		</div>
		<div class="page-summary">
			<p class="lede">{data.post.description}</p>
			<div class="actions"><Button href="/news">All insights</Button></div>
		</div>
	</header>
	<ContentBody body={data.post.body} />
	<RenderNote builtAt={data.builtAt} />
</article>
