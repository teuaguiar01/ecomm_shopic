"use client"
import React, { useEffect, useState, useTransition } from 'react'
import Card from '@/components/ui/Card'
import Sidebar from "@/components/categories/Sidebar";
import { queryAllProducts } from "./product/actions"
import Link from 'next/link'
import { getHidePricesDB } from './actionsSettings'
import { ref, getDownloadURL, list } from "@firebase/storage";
import { storage } from "@/firebase";

export default function Home() {
	const [firstImageUrl, setFirstImageUrl] = useState([]);
	const [isPending, startTransition] = useTransition();
	const [products, setProducts] = useState([]);
	const [hidePrices, setHidePrices] = useState([]);
	const [price, setPrice] = useState([]);

	 const getRandomDefaultImage = () => {
		const defaultImages = [
			'/static/images/default-image1.png',
			'/static/images/default-image2.png',
			'/static/images/default-image3.png',
		];
		const randomIndex = Math.floor(Math.random() * defaultImages.length);
		return defaultImages[randomIndex];
	};

	const getFirstImageFromFolder = async (productId) => {
		try {
			const folderPath = String(productId);
			const folderRef = ref(storage, folderPath);
			const items = await list(folderRef);

			if (items.items.length > 0) {
				const firstItemRef = items.items[0];
				const downloadURL = await getDownloadURL(firstItemRef);
				return downloadURL;
			}
		} catch (error) {
			console.error('Error getting the first image:', error);
		}
	};

	const getPrice = async (product) => {

		if (hidePrices == true) {
			return null;
		}

		let max = 0,
			min = 999999999999;
		product.product_item?.forEach((item) => {
			if (item.amount > 0) {
				max = Math.max(max, item.price);
				min = Math.min(min, item.price);
			}
		})
		if (max == min) return "R$" + max.toFixed(2);
		else if (max != 0) return "R$" + min.toFixed(2) + " - R$" + max.toFixed(2);
		else return "Indisponível";
	};

	useEffect(() => {
		if (!isPending) {
			startTransition(async () => {

				const products = await queryAllProducts();
				setProducts(products);

				const hidePrices = await getHidePricesDB()
				setHidePrices(hidePrices);

				const price = await Promise.all(products.map((product) => getPrice(product)));
				setPrice(price);

				const imageUrls = await Promise.all(products.map((product) =>getFirstImageFromFolder(product.id)));
				setFirstImageUrl(imageUrls);
			})
		}
	}, [])

	return (
		<main className="px-8 w-full flex py-16">
			<div className="hidden md:block">
				<Sidebar />
			</div>
			<div className="min-h-screen flex flex-col items-center justify-start gap-16">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-8">
					{products.map((product, index) => (
						<Link key={product.id} href={`/product/${product.id}`}>
							<Card
								key={product.id}
								name={product.name}
								image={firstImageUrl[index] || getRandomDefaultImage()}
								price={price[index]}
								rating={product.rating}
							/>
						</Link>
					))}
				</div>
			</div>
		</main>
	);
}