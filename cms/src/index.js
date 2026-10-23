const content = require('./seed/content.json');
const { bootstrapDemoAdmin } = require('./demo-admin');

module.exports = {
	async bootstrap({ strapi }) {
		await bootstrapDemoAdmin(strapi);
		if (process.env.SEED_DEMO !== 'true') return;

		// Add missing demo entries only: never overwrite an editor's changes.
		for (const [type, entries] of Object.entries(content)) {
			const documents = strapi.documents(`api::${type}.${type}`);
			for (const entry of entries) {
				const existing = await documents.findFirst({ filters: { slug: entry.slug } });
				if (!existing) {
					const data = { ...entry };
					// Categories are seeded first; link pages using Strapi document IDs.
					if (type === 'page' && entry.category) {
						const category = await strapi.documents('api::category.category').findFirst({
							filters: { slug: entry.category },
							status: 'published'
						});
						if (!category) throw new Error(`Missing seed category: ${entry.category}`);
						data.category = category.documentId;
					}
					await documents.create({ data, status: 'published' });
					strapi.log.info(`Seeded ${type}: ${entry.slug}`);
				}
			}
		}

		// Grant read permissions only. Controllers enforce published content.
		const role = await strapi.db
			.query('plugin::users-permissions.role')
			.findOne({ where: { type: 'public' } });
		for (const type of Object.keys(content)) {
			for (const method of ['find', 'findOne']) {
				const action = `api::${type}.${type}.${method}`;
				const permissions = strapi.db.query('plugin::users-permissions.permission');
				if (!(await permissions.findOne({ where: { action, role: role.id } }))) {
					await permissions.create({ data: { action, role: role.id } });
				}
			}
		}
	}
};
