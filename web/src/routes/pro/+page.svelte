<script lang="ts">
	import { Button } from '@canonical/svelte-ds-app-launchpad';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Your Ubuntu Pro · Ubuntu demo</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container page-content demo-dynamic">
	<div class="dashboard-heading">
		<h1>Hello, {data.user.name.split(' ')[0]}.</h1>
		<Button href="/pro" data-sveltekit-reload>Refresh account</Button>
	</div>
	<p class="subscription-line">
		<strong>{data.subscription.name}</strong> · {data.machines.length} of {data.subscription.limit} machines
	</p>
	<div class="table-wrap">
		<table>
			<caption class="sr-only">Fictional machines attached to your demo subscription</caption>
			<thead
				><tr
					><th scope="col">Machine</th><th scope="col">Operating system</th><th scope="col"
						>Status</th
					></tr
				></thead
			>
			<tbody>
				{#each data.machines as machine}
					<tr
						><th scope="row">{machine.name}</th><td>{machine.version}</td><td
							><span class="protected"
								><span class="status-dot" aria-hidden="true"></span>{machine.status}</span
							></td
						></tr
					>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="render-note">Fictional demo data · Loaded for this visit at {data.checkedAt}</p>
	<Button class="return-link" href="/">Back to the static homepage</Button>
</section>
