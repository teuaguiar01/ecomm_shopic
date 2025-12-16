'use client'

import { Menu, Search, ShoppingCart, UserCircle2, X } from 'lucide-react'
import Link from 'next/link'
import { SearchProduct } from './SearchProduct'
import Image from 'next/image'
import { useEffect, useState, useTransition, useRef } from 'react'
import { getNameDB } from '@/app/(website)/actionsSettings'
import NavbarCart from './navbarCart'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
	const [name, setName] = useState('')
	const [isPending, startTransition] = useTransition()
	const { data: session, status } = useSession()
	const [filterValue, setFilterValue] = useState('')
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
	const dropdownRef = useRef(null)

	async function getName() {
		if (!isPending)
			startTransition(async () => {
				const response = await getNameDB()
				if (response) setName(response.value)
			})
	}

	useEffect(() => {
		getName()
	}, [])

	// Fechar dropdown ao clicar fora
	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsProfileDropdownOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	return (
		<header className="flex justify-between items-center gap-10 max-w-7xl w-full text-zinc-900 border-b border-b-zinc-100 py-5 px-8 relative">
			<div className="flex items-center gap-5">
				<Link href="/" className="flex items-center gap-5">
					<Image src="/static/images/logo.png" alt="me" width="64" height="64" />
					<h1 className="font-primary font-black text-3xl">
						{name ? name : 'SHOPIC'}
					</h1>
				</Link>
			</div>

			{/* Hamburger button (aparece só no mobile) */}
			<button
				className="sm:hidden flex items-center"
				onClick={() => setIsMenuOpen(!isMenuOpen)}
			>
				{isMenuOpen ? <X size={28} /> : <Menu size={28} />}
			</button>

			{/* Menu normal para telas médias e grandes */}
			<div className="hidden sm:flex items-center flex-1 gap-10">
				<nav className="flex flex-row pl-6">
					<Link href="/" className="w-max hover:opacity-60 transition-opacity">
						Shop
					</Link>
				</nav>

				{/* <SearchProduct
					placeholder="Pesquise por produtos..."
					filterValue={filterValue}
					setFilterValue={setFilterValue}
				/> */}

				<div className="relative w-full">
					{/* <input
						type="text"
						placeholder={placeholder}
						onKeyDown={handleKeyPress}
						className="w-full border rounded-full px-12 py-3 bg-zinc-200 focus:outline-none focus:ring focus:border-blue-300"
						value={filterValue} // Keep input controlled by value
						onChange={(e) => setFilterValue(e.target.value)} // Update on change as well
					/> */}
					<div className="absolute inset-y-0 left-4 flex items-center">
						{/* <Search className="text-gray-400" /> */}
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="relative">
						<Link href="/cart">
							<ShoppingCart className="text-xl cursor-pointer" />
							<NavbarCart />
						</Link>
					</div>
					<div className="relative" ref={dropdownRef}>
						<button
							onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
							title={status === 'authenticated' ? 'Olá ' + session?.user?.name : 'Fazer login'}
							className="focus:outline-none"
						>
							<UserCircle2 className="text-xl cursor-pointer hover:opacity-70 transition-opacity" />
						</button>
						
						{isProfileDropdownOpen && (
							<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
								{status === 'authenticated' ? (
									<>
										<Link
											href="/user"
											className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
											onClick={() => setIsProfileDropdownOpen(false)}
										>
											Perfil
										</Link>
										<button
											onClick={() => {
												setIsProfileDropdownOpen(false)
												signOut()
											}}
											className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
										>
											Logout
										</button>
									</>
								) : (
									<Link
										href="/auth/signin"
										className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
										onClick={() => setIsProfileDropdownOpen(false)}
									>
										Fazer Login
									</Link>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Menu mobile (aparece quando clicar no botão) */}
			{isMenuOpen && (
				<div className="absolute top-[100%] left-0 w-full bg-white flex flex-col items-center gap-6 py-6 shadow-md sm:hidden z-50">
					<nav className="flex flex-col gap-4">
						<Link href="/" className="hover:opacity-60 transition-opacity" onClick={() => setIsMenuOpen(false)}>
							Shop
						</Link>
					</nav>

					<SearchProduct
						placeholder="Search for products"
						filterValue={filterValue}
						setFilterValue={setFilterValue}
					/>

					<div className="flex items-center gap-6">
						<Link href="/cart" onClick={() => setIsMenuOpen(false)}>
							<ShoppingCart className="text-2xl" />
						</Link>
						<Link href="/user" onClick={() => setIsMenuOpen(false)}>
							<UserCircle2 className="text-2xl" />
						</Link>
					</div>
				</div>
			)}
		</header>
	)
}
