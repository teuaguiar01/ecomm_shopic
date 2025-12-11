import { AdminTable } from "@/components/admin/adminTable"
import { prisma } from "@/utils/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ManageProducts() {
	const products = await prisma.product.findMany(
		{
			include: {
				product_category: true
			},
			orderBy: {
				id: 'desc'
			}
		}
	)

	for (let i = 0; i < products.length; i++) {
		delete products[i].description
		products[i].category = products[i].product_category.name
		delete products[i].product_categories_id
		delete products[i].product_category
		products[i].rating = products[i].rating.toFixed(0)
	}

	const actions = [
		{
			name: 'Editar',
			color: 'stone',
			dest: '/admin/products/$1/productsItem/add'
		}
	];
	const headers = ['ID', 'Nome', 'Avaliação', "Categoria", "Ação"];

	return (
		<div className="w-full flex justify-start items-center pt-6">
			<AdminTable
				title="Produtos"
				headers={headers}
				data={products}
				actions={actions}
				hasSearchBar={true}
			/>
		</div>
	)
}