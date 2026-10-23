<aside class="rendering-guide container" aria-labelledby="rendering-guide-title">
	<h2 id="rendering-guide-title">What changes, and when?</h2>
	<p>
		<strong class="key-static">Static</strong> — prepared once from the CMS, same for everyone.
		<strong class="key-dynamic">Dynamic</strong> — checked for your visit.
	</p>
	<p class="guide-hint">Try it: sign in, then return to a public page.</p>
</aside>

<style>
	.rendering-guide {
		margin-block: 24px;
	}
	h2 {
		font-size: 18px;
		margin-bottom: 8px;
	}
	p {
		font-size: 13px;
		line-height: 1.7;
		color: var(--muted);
	}
	strong {
		font-weight: 500;
	}
	.key-static {
		color: var(--demo-static);
	}
	.key-dynamic {
		color: var(--demo-dynamic);
		margin-left: 16px;
	}
	.guide-hint {
		margin-top: 4px;
	}
	@media (max-width: 760px) {
		.key-dynamic {
			display: block;
			margin-left: 0;
		}
	}
</style>
