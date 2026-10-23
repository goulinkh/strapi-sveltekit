<script lang="ts">
	import { Button } from '@canonical/svelte-ds-app-launchpad';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Demo sign-in · Ubuntu</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container login-page page-content demo-dynamic">
	<h1>Try the demo account.</h1>
	<p class="lede">No password or real Ubuntu account needed. This is not Ubuntu SSO.</p>
	<div class="demo-person">
		<span class="avatar" aria-hidden="true">AM</span>
		<div><strong>Alex Morgan</strong><span>alex@example.com</span></div>
	</div>
	<form method="POST">
		<input type="hidden" name="next" value={data.next} />
		<Button type="submit" severity="positive">Sign in as Alex (demo)</Button>
	</form>
</section>
