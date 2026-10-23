const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreController('api::category.category', () => ({
	async find(ctx) {
		ctx.query = { ...ctx.query, status: 'published' };
		return super.find(ctx);
	},
	async findOne(ctx) {
		ctx.query = { ...ctx.query, status: 'published' };
		return super.findOne(ctx);
	}
}));
