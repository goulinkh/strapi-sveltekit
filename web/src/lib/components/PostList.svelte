<script lang="ts">
	import { Button } from '@canonical/svelte-ds-app-launchpad';
	import type { Post } from '$lib/types';
	let { posts }: { posts: Post[] } = $props();
</script>

<ul class="post-list">
	{#each posts as post}
		<li>
			<div>
				<p class="eyebrow">{post.category}</p>
				<h2>{post.title}</h2>
				<p>{post.description}</p>
			</div>
			<Button href={`/news/${post.slug}`} aria-label={`Read ${post.title}`}>Read story</Button>
		</li>
	{/each}
</ul>
