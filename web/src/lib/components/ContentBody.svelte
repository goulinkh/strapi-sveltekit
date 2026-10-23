<script lang="ts">
	let { body }: { body: string } = $props();
</script>

<div class="content-body">
	{#each body.split(/\n\s*\n/) as section}
		{@const [heading, ...paragraph] = section.split('\n')}
		{#if paragraph.length}
			<section class="content-section">
				<h2>{heading}</h2>
				<p>{paragraph.join(' ')}</p>
			</section>
		{:else}
			<p>{heading}</p>
		{/if}
	{/each}
</div>
