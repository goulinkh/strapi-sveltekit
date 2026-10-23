const { factories } = require('@strapi/strapi');

// Editorial drafts must never be exposed through the public content API.
module.exports = factories.createCoreController('api::page.page', () => ({
	async find(ctx) {
		ctx.query = { ...ctx.query, status: 'published' };
		return super.find(ctx);
	},
	async findOne(ctx) {
		ctx.query = { ...ctx.query, status: 'published' };
		return super.findOne(ctx);
	}
}));
