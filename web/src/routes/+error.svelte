<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '@canonical/svelte-ds-app-launchpad';
</script>

<svelte:head><title>{page.status} · Ubuntu demo</title></svelte:head>
<section class="container page-content demo-shared">
	<div class="error-content">
		<p class="eyebrow">{page.status}</p>
		<h1>{page.status === 404 ? 'Nothing here just yet.' : 'Something went wrong.'}</h1>
		<p class="lede">{page.error?.message}</p>
		<Button href="/">Back to the overview</Button>
	</div>
</section>
