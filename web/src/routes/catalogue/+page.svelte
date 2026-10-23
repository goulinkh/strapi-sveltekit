<script lang="ts">
	import { Button } from '@canonical/svelte-ds-app-launchpad';
	import RenderNote from '$lib/components/RenderNote.svelte';
	import type { PageData } from './$types';

	type FileEntry = { href: string; filename: string; title: string };

	let { data }: { data: PageData } = $props();
	let query = $state('');
	let collapsed = $state<Record<string, boolean>>({});

	const rootFiles = $derived<FileEntry[]>([
		...data.rootPages.map((page) => ({ ...page, title: page.title.replaceAll('\n', ' ') })),
		{ href: '/catalogue', filename: 'catalogue.html', title: 'This catalogue' },
		{ href: '/news', filename: 'news.html', title: 'Insights index' }
	]);
	const folders = $derived([
		...data.categories.map((category) => ({
			slug: category.slug,
			title: category.title,
			isCategory: true,
			files: category.pages as FileEntry[]
		})),
		{
			slug: 'news',
			title: 'Insights',
			isCategory: false,
			files: data.posts.map((post) => ({
				href: `/news/${post.slug}`,
				filename: `${post.slug}.html`,
				title: post.title
			}))
		}
	]);
	const filter = $derived(query.trim().toLowerCase());
	const matches = (file: FileEntry) =>
		`${file.filename} ${file.title} ${file.href}`.toLowerCase().includes(filter);
	const visibleRootFiles = $derived(rootFiles.filter(matches));
	const visibleFolders = $derived(
		folders
			.map((folder) => ({
				...folder,
				files: `${folder.slug} ${folder.title}`.toLowerCase().includes(filter)
					? folder.files
					: folder.files.filter(matches)
			}))
			.filter((folder) => !filter || folder.files.length > 0)
	);
	const visibleCount = $derived(
		visibleRootFiles.length +
			visibleFolders.reduce((count, folder) => count + folder.files.length, 0)
	);
</script>

<svelte:head>
	<title>Static page catalogue · Ubuntu demo</title>
	<meta name="description" content="A file-tree view of the public pages built from Strapi." />
</svelte:head>

{#snippet icon(kind: 'file' | 'folder' | 'chevron' | 'search')}
	<svg
		class="icon {kind}-icon"
		width={kind === 'chevron' ? 12 : 16}
		height={kind === 'chevron' ? 12 : 16}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		{#if kind === 'file'}
			<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" />
			<path d="M14 3v5h5M8 12h8M8 16h6" />
		{:else if kind === 'folder'}
			<path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" />
		{:else if kind === 'chevron'}
			<path d="m9 5 7 7-7 7" />
		{:else}
			<circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" />
		{/if}
	</svg>
{/snippet}

{#snippet fileLink(file: FileEntry)}
	<li>
		<a
			href={file.href}
			aria-current={file.href === '/catalogue' ? 'page' : undefined}
			title={`${file.filename} — ${file.title}`}
		>
			{@render icon('file')}
			<code class="filename">{file.filename}</code>
			<span class="file-title">{file.title}</span>
		</a>
	</li>
{/snippet}

<section class="container page-content catalogue demo-static">
	<h1>What did we build?</h1>
	<p class="lede">
		{data.count} static pages in this build, grouped by their Strapi categories. Each category can contain
		any number of pages.
	</p>

	<div class="explorer">
		<div class="explorer-toolbar">
			<label class="file-filter">
				{@render icon('search')}
				<span class="sr-only">Filter pages</span>
				<input type="search" bind:value={query} placeholder="Filter by name, title or path…" />
			</label>
			<div class="folder-actions">
				<button type="button" disabled={!!filter} onclick={() => (collapsed = {})}
					>Expand all</button
				>
				<button
					type="button"
					disabled={!!filter}
					onclick={() =>
						(collapsed = Object.fromEntries(folders.map((folder) => [folder.slug, true])))}
					>Collapse all</button
				>
			</div>
		</div>

		<div class="tree-root">
			{@render icon('folder')}
			<code>prerendered/</code>
			<span class="file-count" role="status">
				{filter ? `${visibleCount} of ${data.count}` : data.count} pages
			</span>
		</div>
		<ul class="file-tree" aria-label="Built static pages">
			{#each visibleRootFiles as file (file.href)}
				{@render fileLink(file)}
			{/each}
			{#each visibleFolders as folder (folder.slug)}
				<li>
					<details
						open={!!filter || !collapsed[folder.slug]}
						ontoggle={(event) => {
							if (!filter) collapsed[folder.slug] = !event.currentTarget.open;
						}}
					>
						<summary>
							{@render icon('chevron')}
							{@render icon('folder')}
							<span class="folder-heading">
								<code>{folder.slug}/</code>
								<span class="folder-title">{folder.title}</span>
							</span>
							<span class="folder-count" aria-label={`${folder.files.length} pages built`}>
								{folder.files.length} pages
							</span>
						</summary>
						<ul aria-label={folder.title}>
							{#each folder.files as file (file.href)}
								{@render fileLink(file)}
							{:else}
								<li class="empty-folder">No published pages.</li>
							{/each}
						</ul>
						{#if folder.isCategory && !filter}
							<p class="folder-growth">More pages can go here</p>
						{/if}
					</details>
				</li>
			{/each}
		</ul>
		{#if filter && visibleCount === 0}
			<p class="no-results">No pages match “{query}”. Try another name or path.</p>
		{/if}
	</div>
	<div class="catalogue-next">
		<div>
			<h2>Add content, not route files</h2>
			<p>
				Publish another page in Strapi, choose its category, then rebuild. Its URL, HTML file and
				catalogue entry are generated automatically.
			</p>
		</div>
		<Button href={data.createPageUrl} target="_blank" rel="noopener noreferrer">
			Add a page in Strapi
		</Button>
	</div>
	<RenderNote builtAt={data.builtAt} />
</section>

<style>
	.catalogue-next {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 16px 32px;
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid var(--demo-border);
	}
	.catalogue-next > div {
		flex: 1 1 300px;
	}
	.catalogue-next h2 {
		margin-bottom: 8px;
		font-size: 20px;
	}
	.catalogue-next p {
		max-width: 560px;
		font-size: 14px;
	}
	h1 {
		font-size: clamp(1.8rem, 3vw, 2.5rem);
	}
	.lede {
		margin-top: 8px;
		font-size: 14px;
	}
	.explorer {
		margin-top: 20px;
		border: 1px solid var(--line);
		border-radius: 4px;
	}
	.explorer-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 10px 12px;
		border-bottom: 1px solid var(--line);
	}
	.file-filter {
		display: flex;
		align-items: center;
		gap: 8px;
		width: min(100%, 380px);
		padding: 4px 8px;
		border: 1px solid #aaa;
		border-radius: 3px;
	}
	.file-filter:focus-within {
		outline: 2px solid #1668c1;
		outline-offset: 2px;
	}
	input {
		width: 100%;
		min-width: 0;
		padding: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: inherit;
		font-size: 13px;
	}
	input::placeholder {
		color: var(--muted);
		opacity: 1;
	}
	.folder-actions {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}
	button {
		padding: 4px 8px;
		border: 0;
		border-radius: 3px;
		background: transparent;
		color: var(--muted);
		font-size: 12px;
		cursor: pointer;
	}
	button:hover:not(:disabled) {
		background: #f2f2f2;
		color: #252525;
	}
	button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.tree-root {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px 6px;
		font-size: 13px;
	}
	.file-count {
		margin-left: auto;
		color: var(--muted);
		font-size: 12px;
	}
	.file-tree {
		margin: 0;
		padding: 0 8px 10px;
		list-style: none;
		font-size: 13px;
	}
	.file-tree ul {
		margin: 0 0 0 35px;
		padding: 0;
		border-left: 1px solid var(--line);
		list-style: none;
	}
	.file-tree li {
		padding: 0;
	}
	.file-tree a {
		display: grid;
		grid-template-columns: 16px minmax(0, 1fr) minmax(0, 1fr);
		align-items: center;
		gap: 8px;
		min-height: 30px;
		padding: 4px 8px 4px 28px;
		border-radius: 3px;
		text-decoration: none;
	}
	.file-tree a::before {
		content: none;
	}
	.file-tree a:hover,
	summary:hover {
		background: #f2f2f2;
		text-decoration: none;
	}
	.file-tree a[aria-current='page'] {
		background: #f4f4f4;
		box-shadow: inset 2px 0 #c64010;
	}
	.file-tree a:focus-visible,
	summary:focus-visible {
		outline: 2px solid #1668c1;
		outline-offset: -2px;
	}
	.file-tree code {
		color: #333;
		font-size: 13px;
	}
	.filename,
	.file-tree .file-title,
	.folder-heading {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.file-tree .file-title {
		padding: 0;
		flex-basis: auto;
		color: var(--muted);
		font-size: 12px;
	}
	summary {
		display: grid;
		grid-template-columns: 12px 16px minmax(0, 1fr) auto;
		align-items: center;
		gap: 8px;
		min-height: 30px;
		padding: 4px 8px;
		border-radius: 3px;
		list-style: none;
		cursor: pointer;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	.folder-title {
		margin-left: 12px;
		color: var(--muted);
		font-size: 12px;
	}
	.folder-count {
		color: var(--muted);
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}
	.folder-growth {
		position: relative;
		margin-left: 35px;
		padding: 6px 8px 10px 28px;
		border-left: 1px dashed #a5aea7;
		color: var(--muted);
		font-size: 12px;
	}
	.folder-growth::before {
		content: '';
		position: absolute;
		top: 16px;
		left: 0;
		width: 18px;
		border-top: 1px dashed #a5aea7;
	}
	.icon {
		display: block;
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		color: var(--muted);
	}
	.folder-icon {
		color: #8b5e26;
	}
	.chevron-icon {
		width: 12px;
		height: 12px;
	}
	details[open] > summary .chevron-icon {
		transform: rotate(90deg);
	}
	.file-tree .empty-folder,
	.no-results {
		padding: 8px 12px;
		color: var(--muted);
		font-size: 13px;
	}
	@media (max-width: 600px) {
		.explorer-toolbar {
			flex-wrap: wrap;
			gap: 8px;
		}
		.file-filter {
			width: 100%;
		}
		.folder-actions {
			margin-left: auto;
		}
		.file-tree a {
			grid-template-columns: 16px minmax(0, 1fr);
			gap: 0 8px;
			padding-block: 6px;
		}
		.file-tree a .icon {
			grid-row: span 2;
		}
		.file-tree .file-title {
			grid-column: 2;
			font-size: 11px;
		}
		.folder-title {
			display: none;
		}
		summary {
			min-height: 36px;
		}
	}
</style>
