'use client'
import React, { useEffect, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '@tremor/react';
import { createStaticPix } from 'pix-utils';
import QRCode from 'qrcode';
import ReceiptUpload from '@/components/ui/receiptUpload';
import { getReceiptUrl } from '@/utils/receiptStorage';

export default function CardConfirmacao(props) {
	const pedido = props.pedido;
	const produtos = pedido.order_items;
	const user = pedido.user;
	const adress = pedido.address;
	const [price, setPrice] = useState(0);
	const [qrBase64, setQrBase64] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [pixPayload, setPixPayload] = useState('');
	const [receiptUrl, setReceiptUrl] = useState(null);
	const [receiptExists, setReceiptExists] = useState(false);
	const username = localStorage.getItem('name');


	useEffect(() => {
		const storedPrice = localStorage.getItem('price');
		if (storedPrice) setPrice(parseFloat(storedPrice));
	}, []);

	// Check if receipt already exists
	useEffect(() => {
		const checkReceipt = async () => {
			try {
				const url = await getReceiptUrl(pedido.id.toString());
				if (url) {
					setReceiptUrl(url);
					setReceiptExists(true);
				}
			} catch (error) {
				console.error('Error checking receipt:', error);
			}
		};

		if (pedido.id) {
			checkReceipt();
		}
	}, [pedido.id]);

	useEffect(() => {
		if (price > 0 && username) {
			generatePixCode();
		}
	}, [price, username]);

	const generatePixCode = async () => {
		try {
			// Criar o código PIX usando pix-utils
			const pixData = createStaticPix({
				merchantName: username || 'SHOPIC',
				merchantCity: 'Salvador',
				pixKey: '86300844560', // Chave PIX
				infoAdicional: `Pedido ${pedido.id}`,
				transactionAmount: price
			});

			const pixCodeString = pixData.toBRCode();

			if (!pixCodeString || typeof pixCodeString !== 'string') {
				throw new Error('Não foi possível gerar o código PIX');
			}

			// Definir o código PIX em texto
			setPixPayload(pixCodeString);

			// Gerar QR Code a partir do código PIX
			const qrCodeDataURL = await QRCode.toDataURL(pixCodeString, {
				width: 300,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#FFFFFF'
				},
				errorCorrectionLevel: 'M'
			});

			setQrBase64(qrCodeDataURL);
		} catch (error) {
			setPixPayload('Erro ao gerar código PIX');
			setQrBase64('');
		}
	};

	return (
		<div className="bg-white flex flex-col items-center shadow-lg h-4/5 w-full py-5">
			{pedido.status === 'completed' ||
				pedido.status === 'shipped' ||
				pedido.status === 'delivered' ? (
				<React.Fragment>
					<div className="text-start font-bold text-2xl mb-4">
						<h2>Pedido Confirmado</h2>
					</div>

					<div className="bg-green-100 p-4 h-auto md:h-2/6 border border-green-400 w-auto md:w-2/3 rounded-sm">
						<p className="text-green-800">
							<strong>Seu pedido foi realizado com sucesso.</strong>
						</p>
						<p className="text-green-700">
							Obrigado por comprar conosco <strong>{user.name}</strong>.
							Em breve você receberá um email no endereço
							<strong> {user.email} </strong>
							com todos os detalhes do pedido
						</p>
						<div className="flex items-center bg-green-500 h-auto md:h-2/6 border border-green-400 w-auto md:w-full mt-8">
							<p className="text-green-50">
								<strong>✅ Pagamento Aprovado </strong>
							</p>
						</div>
					</div>
				</React.Fragment>
			) : pedido.status === 'payment-pending' ||
				pedido.status === 'pending_verification' ||
				pedido.status === 'processing' ||
				pedido.status === 'waiting' ? (
				<React.Fragment>
					<div className="text-start font-bold text-2xl mb-4">
						<h2>Pedido Confirmado</h2>
					</div>

					<div className="bg-yellow-100 p-4 h-auto md:h-2/6 border border-yellow-400 w-auto md:w-2/3 rounded-sm">
						<div className="flex items-center bg-yellow-500 h-auto md:h-2/6 border border-yellow-400 w-auto md:w-full rounded">
							<p className="text-green-50">
								<strong>⏳ Aguardando Pagamento </strong>
							</p>
						</div>
						<p className="text-yellow-800 mt-6">
							<strong>Seu pedido foi realizado com sucesso.</strong>
						</p>
						<p className="text-yellow-700">
							Obrigado por comprar conosco <strong>{user.name}</strong>.
							<br />
							Seu pedido está aguardando pagamento. Após a confirmação,
							começaremos a preparar sua compra com carinho. <br />
							<br /> Agradecemos por escolher a nossa loja! Em breve você
							receberá um email no endereço
							<strong> {user.email} </strong>
							com todos os detalhes do pedido
						</p>
						<div className="p-4 h-auto md:h-2/6 w-auto md:w-full rounded-sm justify-center">
							<div className="flex justify-center text-white">
								{qrBase64 ? (
									<img src={qrBase64} alt="QR PIX" />
								) : (
									<div>PIX INVALIDO</div>
								)}
							</div>
							<div className="flex justify-center mt-4">
								<button
									className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-48"
									onClick={() => {
										if (pixPayload) {
											navigator.clipboard.writeText(pixPayload);
											alert('Código PIX copiado com sucesso!');
										} else {
											alert('Erro: Código PIX não disponível.');
										}
									}}
								>
									Copiar Código PIX
								</button>
							</div>
							<div className="flex justify-center mt-4">
								{receiptExists ? (
									<div className="text-center">
										<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-2">
											✅ Comprovante enviado! Aguardando verificação.
										</div>
										<button
											className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-48"
											onClick={() => setIsModalOpen(true)}
										>
											Ver/Alterar Comprovante
										</button>
									</div>
								) : (
									<button
										className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-48"
										onClick={() => setIsModalOpen(true)}
									>
										Enviar Comprovante
									</button>
								)}
							</div>
						</div>
					</div>

					{/* Modal */}
					{isModalOpen && (
						<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
							<div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-lg font-bold">Comprovante de Pagamento</h3>
									<button
										className="text-gray-500 hover:text-gray-700"
										onClick={() => setIsModalOpen(false)}
									>
										✕
									</button>
								</div>

								{receiptExists && receiptUrl ? (
									<div className="mb-4">
										<p className="text-green-700 mb-2 font-medium">
											✅ Comprovante enviado com sucesso!
										</p>
										<div className="border rounded-lg p-2 bg-gray-50">
											<img
												src={receiptUrl}
												alt="Comprovante de Pagamento"
												className="w-full max-w-xs mx-auto rounded"
											/>
										</div>
										<p className="text-sm text-gray-600 mt-2">
											Seu comprovante está sendo verificado. Você pode enviar um novo se necessário.
										</p>
									</div>
								) : (
									<div className="mb-4">
										<p className="text-gray-700 mb-2">
											Envie o comprovante de pagamento PIX para confirmar seu pedido.
										</p>
										<p className="text-sm text-gray-600">
											Formatos aceitos: JPG, PNG, WebP (máx. 5MB)
										</p>
									</div>
								)}

								<ReceiptUpload
									orderId={pedido.id.toString()}
									onSuccess={() => {
										setIsModalOpen(false);
										// Refresh receipt status
										setReceiptExists(true);
										window.location.reload();
									}}
								/>

								<div className="flex justify-end mt-4">
									<button
										className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
										onClick={() => setIsModalOpen(false)}
									>
										Cancelar
									</button>
								</div>
							</div>
						</div>
					)}
				</React.Fragment>
			) : pedido.status === 'canceled' ? (
				<React.Fragment>
					<div className="text-start font-bold text-2xl mb-4">
						<h2>Pedido Cancelado</h2>
					</div>

					<div className="bg-red-100 p-4 h-auto md:h-2/6 border border-red-400 w-auto md:w-2/3 rounded-sm">
						<p className="text-red-800">
							{' '}
							<strong></strong>
						</p>
						<br></br>
						<p className="text-red-700">
							Prezado <strong>{user.name}</strong>,<br></br>
							<br></br>
							Lamentamos informar que seu pedido foi cancelado.
							Entendemos que circunstâncias imprevistas podem ocorrer,
							levando a esse cancelamento. Pedimos desculpas por qualquer
							inconveniente causado. Se você tiver alguma dúvida ou
							precisar de assistência adicional, por favor, não hesite em
							entrar em contato conosco.<br></br>
							<br></br>
							Agradecemos pelo seu interesse em nossa loja e esperamos
							poder atendê-lo(a) novamente no futuro. Estamos à
							disposição para ajudá-lo(a) com qualquer outra questão que
							possa ter.
						</p>
						<div className="flex items-center bg-red-500 h-auto md:h-2/6 border border-red-400 w-auto md:w-full mt-8">
							<p className="text-red-50">
								<strong>🚫 Pedido Cancelado </strong>
							</p>
						</div>
					</div>
				</React.Fragment>
			) : null}

			<br></br>

			<div className=" p-4 h-auto md:h-2/6 border border-black w-auto md:w-2/3 rounded-sm ">
				<h4 className="font-bold">Informações Do Pedido</h4>
				<br></br>
				<p> Numero do pedido: {pedido.order_number}</p>
				<br></br>
				<div className="flex justify-center bg-black text-white">Items</div>

				<Table className="border-collapse w-full h-full">
					<TableHead className="border-2 border-solid border-grey-300 p-2 text-justify">
						<TableRow>
							<TableHeaderCell>Produto</TableHeaderCell>
							<TableHeaderCell>Quantidade</TableHeaderCell>
							<TableHeaderCell>Total</TableHeaderCell>
						</TableRow>
					</TableHead>
					<TableBody className="border-2 border-solid border-grey-200 p-4 text-justify">
						{produtos.map((produto) => (
							<TableRow
								className="border-2 border-solid border-grey-200 p-4 text-justify"
								key={produto.products_id}
							>
								<TableCell>
									{produto.product.productItem_product.name}{' '}
									<span className="text-xs italic">
										({produto.product.size})
									</span>
								</TableCell>
								<TableCell>x{produto.quantity}</TableCell>
								<TableCell>R${produto.price}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<br></br>
				<div>
					{' '}
					Total: <strong>R${pedido.total}</strong>
				</div>

				<br></br>
				<p>
					*Os produtos serão enviados em até 2 dias após a confirmação do
					pagamento.
				</p>
			</div>
			<div className=" p-4 h-auto md:h-2/6 border border-black w-auto md:w-2/3 rounded-sm ">
				<h4 className="font-bold">Informações de Cobrança</h4>

				<p>{user.name}</p>
				<p>Cep: {adress[0].zip_code}</p>
				<p>
					{adress[0].street} {adress[0].number} {adress[0].complement}{' '}
					{adress[0].neighborhood}
				</p>
				<p>
					{adress[0].complemente2} {adress[0].city} - {adress[0].state}
				</p>
				<p>{adress[0].country}</p>
				{/*Adicionar campos de endereço*/}
			</div>
		</div>
	)
}