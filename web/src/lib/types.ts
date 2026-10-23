export type User = { name: string; email: string };

export type Category = { slug: string; title: string };

type EditorialContent = {
	slug: string;
	title: string;
	description: string;
	body: string;
};

export type ContentPage = EditorialContent & { category: Category | null };
export type Post = EditorialContent & { category: string };
