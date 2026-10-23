<script lang="ts">
	import { Button } from '@canonical/svelte-ds-app-launchpad';
	import RenderNote from '$lib/components/RenderNote.svelte';
	import ContentBody from '$lib/components/ContentBody.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Ubuntu · Open possibilities</title>
	<meta name="description" content={data.home.description} />
</svelte:head>

<section class="container page-content demo-static">
	<div class="home-content">
		<div>
			<h1 class="home-title">{data.home.title}</h1>
			<p class="lede">{data.home.description}</p>
			<div class="actions">
				<Button href="/catalogue" severity="positive">View static catalogue</Button>
				<Button href="/pro">Open your Pro dashboard</Button>
			</div>
		</div>
		{#if data.featuredPost}
			<aside class="featured-story" aria-label="Sample CMS story">
				<p class="eyebrow">A story from the CMS</p>
				<h2>{data.featuredPost.title}</h2>
				<p>{data.featuredPost.description}</p>
				<Button href={`/news/${data.featuredPost.slug}`}>Read story</Button>
			</aside>
		{/if}
	</div>
	<ContentBody body={data.home.body} />
	<RenderNote builtAt={data.builtAt} />
</section>
