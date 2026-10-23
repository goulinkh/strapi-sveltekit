<script lang="ts">
	let { builtAt }: { builtAt: string } = $props();
</script>

<p class="render-note" data-rendering="static">
	Prepared {new Date(builtAt).toLocaleString('en-GB', {
		timeZone: 'UTC',
		dateStyle: 'medium',
		timeStyle: 'short'
	})} UTC · CMS changes need a rebuild.
</p>
