'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ToggleGroup } from './toggleGroup'
import { useCart } from '@/components/CartContext'
import { toast } from 'react-toastify'

export default function Filtros({ produto }) {
	const [sku, setSku] = useState()
	const [price, setPrice] = useState()
    const [enable, setEnable] = useState()
	const [stock, setStock] = useState(1)
	const [qty, setQty] = useState(1)
	const router = useRouter()

	// Agrupar itens por tamanho usando useMemo para evitar recalcular
	const items_produto = useMemo(() => {
		const groupedItems = produto.product_item.reduce((acc, item) => {
			const existingItem = acc.find(i => i.size === item.size);
			if (existingItem) {
				// Se já existe um item com esse tamanho, somar o estoque
				existingItem.amount += item.amount;
				// Manter o menor preço
				existingItem.price = Math.min(existingItem.price, item.price);
				// Adicionar SKUs alternativos
				if (!existingItem.skus) {
					existingItem.skus = [existingItem.sku];
				}
				existingItem.skus.push(item.sku);
			} else {
				// Adicionar novo item
				acc.push({ ...item });
			}
			return acc;
		}, []);

		// Ordenar por tamanho
		const tamanhoOrder = { 'PP': 1,'P': 2, 'M': 3, 'G': 4, 'GG': 5 };
		groupedItems.sort((a, b) => {
			const tamanhoA = tamanhoOrder[a.size] || 999;
			const tamanhoB = tamanhoOrder[b.size] || 999;
			return tamanhoA - tamanhoB;
		});

		return groupedItems;
	}, [produto.product_item]);

	useEffect(() => {
		// Buscar no array agrupado
		const selectedItem = items_produto.find(item => item.sku === sku);
		if (selectedItem) {
			setPrice(selectedItem.price);
			setStock(selectedItem.amount);
			setQty(Math.min(qty, selectedItem.amount));
		}
	}, [sku, items_produto])

	const { addToCart, cartItems } = useCart()
	function handleClick() {
		if (!sku) toast.error('Selecione um tamanho primeiro')
		if (qty == 0 ) toast.error('Adicione uma quantidade')
		else addToCart(sku, produto, qty)
	}

	function handleClick2() {
		if (!sku) toast.error('Selecione um tamanho primeiro')
		else  {
			const skuAlreadyAdded = cartItems.some((item) => item.item.sku.trim() === sku.trim());

			if (skuAlreadyAdded == false) {
				if (qty == 0 ) toast.error('Adicione uma quantidade')
				else {
					addToCart(sku, produto, qty)
					router.push('/cart')
				}
			} else {
				router.push('/cart')
			}
		}
	}

	function addQty() {
		setQty(Math.min(qty + 1, stock))
	}

	function decQty() {
		if (qty !== 0) {
			setQty(qty - 1)
		}
	}
	
	return (
		<>
			<div className="flex flex-col gap-4">
				<h3>Escolha o tamanho</h3>
				<ToggleGroup.Root
					value={sku}
					onChange={setSku}
					className="flex gap-4"
				>
					{items_produto.map((item) => {
						return (
							item.sku && ( // Only render if item.sku is not empty
								<ToggleGroup.Button
									key={item.sku}
									value={item.sku}
									onClick={() => setEnable(item.amount < 1)}
									className="px-6 rounded-full"
								>
									{item.size}
								</ToggleGroup.Button>
							)
						);
					})}
				</ToggleGroup.Root>
			</div>
			{price && (
				<><span className="text-2xl">
					Preço: R${(price * qty).toFixed(2)}
				</span>
				<span className='text-xs'>Estoque: {stock > 0 ? stock : "indisponível"} {stock > 1? "unidades disponíveis" : (stock  == 1 ? "unidade disponível" : "")}</span>
				</>
			)}
			<hr className="my-4"></hr>
			<div className="flex flex-row text-black gap-4">
				<div className="text-xl flex items-center">
					<button
						onClick={decQty}
						className="bg-zinc-300 px-4 py-2 rounded-l-full"
					>
						-
					</button>
					<input
						className="bg-zinc-300 px-4 py-2 text-center remove-arrow w-20"
						type="number"
						disabled
						value={qty}
					></input>
					<button
						onClick={addQty}
						className="bg-zinc-300 px-4 py-2 rounded-r-full"
					>
						+
					</button>
				</div>
				<button onClick={handleClick} disabled={enable ? true : false} className="border-2 border-black bg-black text-white rounded-full hover:bg-transparent hover:text-black duration-300 w-auto flex-grow py-2 px-8 disabled:text-black disabled:border-zinc-300 disabled:bg-zinc-300">
                    {enable && (
                        <>
                            Indisponível
                        </>
                    )}
                    {!enable && (
                        <>
                           Adicionar ao carrinho
                        </>
                    )}
                    
                </button>
				<button onClick={handleClick2} disabled={enable ? true : false} className="border-2 border-black bg-black text-white rounded-full hover:bg-transparent hover:text-black duration-300 w-auto py-2 px-8 disabled:text-black disabled:border-zinc-300 disabled:bg-zinc-300">
                    {enable && (
                        <>
                            Indisponível
                        </>
                    )}
                    {!enable && (
                        <>
                           Comprar
                        </>
                    )}
                    
                </button>
			</div>
		</>
	)
}
