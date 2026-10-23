<script lang="ts">
	import PublicPage from '$lib/components/PublicPage.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<PublicPage content={data.content} builtAt={data.builtAt} />
