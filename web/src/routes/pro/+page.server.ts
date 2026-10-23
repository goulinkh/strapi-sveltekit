import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) redirect(303, '/login?next=%2Fpro');

	// Fictional private service response. Deliberately independent of the CMS.
	return {
		user: locals.user,
		checkedAt: new Date().toISOString(),
		subscription: { name: 'Ubuntu Pro — personal', limit: 5 },
		machines: [
			{
				name: 'alex-workstation',
				version: 'Ubuntu 24.04 LTS',
				services: 'ESM · Livepatch',
				status: 'Protected'
			},
			{
				name: 'home-server',
				version: 'Ubuntu 24.04 LTS',
				services: 'ESM · Livepatch',
				status: 'Protected'
			},
			{ name: 'dev-sandbox', version: 'Ubuntu 22.04 LTS', services: 'ESM', status: 'Protected' }
		]
	};
};
