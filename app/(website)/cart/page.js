'use client'
import { useCart } from '@/components/CartContext'
import Link from 'next/link'

export default function Cart() {
	const { cartItems, cartTotal, clearCart } = useCart()

	return (
		<div className="max-w-7xl w-full pt-5 pb-8 px-8">
			<h1 className="mb-2 text-4xl font-black">Carrinho</h1>
			{cartItems.length === 0 ? (
				<h2>Seu carrinho está vazio</h2>
			) : (
				<>
					{/* Cabeçalho da tabela */}
					<div className="hidden sm:grid grid-cols-4 gap-5 text-sm text-center font-bold border-b pb-2">
						{/* <div>Imagem</div> */}
						<div>Nome do Produto</div>
						<div>Quantidade</div>
						<div>Preço</div>
						<div>Subtotal</div>
					</div>

					{/* Itens do carrinho */}
					<div className="grid gap-5 mt-5">
						{cartItems.map((item) => (
							<div key={item.item.sku} className="grid sm:grid-cols-4 grid-cols-1 gap-4 border-b pb-5">
								{/* Imagem */}
								{/* <div className="text-center">
									<img src={item.item.imageUrl} alt={item.item.name} className="w-20 h-20 object-cover mx-auto" />
								</div> */}

								{/* Nome do Produto */}
								<div className="text-center">
									<span className="sm:hidden font-bold">Nome Produto: </span>
									<span>{item.product.name}</span>
								</div>

								{/* Quantidade */}
								<div className="text-center">
									<span className="sm:hidden font-bold">Quantidade: </span>
									<span>{item.quantity}</span>
								</div>

								{/* Preço */}
								<div className="text-center">
									<span className="sm:hidden font-bold">Preço: </span>
									<span>R${item.item.price.toFixed(2)}</span>
								</div>

								{/* Subtotal */}
								<div className="text-center">
									<span className="sm:hidden font-bold">Subtotal: </span>
									<span>R${(item.item.price * item.quantity).toFixed(2)}</span>
								</div>
							</div>
						))}
					</div>

					{/* Total */}
					<div className="mt-5 flex justify-end bg-zinc-50 p-5">
						<div className="text-lg font-bold">Total: R${cartTotal.toFixed(2)}</div>
					</div>

					{/* Botões de Ação */}
					<div className="mt-5 bg-zinc-50 p-5 flex flex-col sm:flex-row gap-3">
						<button 
							onClick={() => {
								if (window.confirm('Tem certeza que deseja limpar todo o carrinho?')) {
									clearCart();
								}
							}}
							className="bg-red-600 text-white border-2 border-red-600 hover:bg-transparent hover:text-red-600 duration-300 rounded-full py-2 px-4 sm:w-auto w-full"
						>
							Limpar Carrinho
						</button>
						<Link href="/checkout" className="flex-1">
							<button className="bg-black text-white border-2 border-black hover:bg-transparent hover:text-black duration-300 w-full rounded-full py-2 px-4">
								Finalizar compra
							</button>
						</Link>
					</div>
				</>
			)}
		</div>
	)
}
