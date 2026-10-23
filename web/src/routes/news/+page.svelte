<script lang="ts">
	import PostList from '$lib/components/PostList.svelte';
	import RenderNote from '$lib/components/RenderNote.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head
	><title>Insights · Ubuntu demo</title><meta
		name="description"
		content="Sample stories from the world of Ubuntu and open source."
	/></svelte:head
>
<section class="container page-content demo-static">
	<header class="page-hero">
		<div>
			<p class="eyebrow">Ubuntu insights</p>
			<h1>Fresh perspectives.</h1>
		</div>
	</header>
	<PostList posts={data.posts} />
	<RenderNote builtAt={data.builtAt} />
</section>
