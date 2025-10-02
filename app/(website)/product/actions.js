'use server'

import { prisma } from "@/utils/prisma"

async function queryAllProducts() {
	// Primeiro, obter o ID da categoria "Inativos" se existir
	const inactiveCategory = await prisma.productCategory.findFirst({
		where: {
			name: "Inativos"
		}
	});

	const products = await prisma.product.findMany({
		where: {
			// Excluir produtos da categoria "Inativos"
			product_categories_id: {
				not: inactiveCategory?.id
			}
		},
		include: {
			product_item: {
				select: {
					price: true,
					amount: true
				}
			}
		}
	});
	return products;
}
  

async function queryAllProductsPrice(categoryId, priceSearch) {
	// Primeiro, obter o ID da categoria "Inativos" se existir
	const inactiveCategory = await prisma.productCategory.findFirst({
		where: {
			name: "Inativos"
		}
	});

	const products = await prisma.product.findMany({
		where:{
			product_categories_id: categoryId? categoryId : {
				// Se não especificou categoria, excluir apenas "Inativos"
				not: inactiveCategory?.id
			},
			product_item:{
				some:{
					price:priceSearch
				}
			}
		},
		include: {
			product_item: {
				select: {
					price: true,
					amount: true
				}
			}
		}
	})
	return products;
}

export { queryAllProducts, queryAllProductsPrice }