'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStaticPix } from 'pix-utils';
import QRCode from 'qrcode';
import ReceiptUpload from '@/components/ui/receiptUpload';
import { completePaymentWithReceipt } from './actions';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PaymentPage() {
    const [price, setPrice] = useState(0);
    const [qrBase64, setQrBase64] = useState("");
    const [pixCode, setPixCode] = useState("");
    const [orderId, setOrderId] = useState(null);
    const [receiptUploaded, setReceiptUploaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedPrice = localStorage.getItem('price');
        const storedOrderId = localStorage.getItem('orderId');

        if (storedPrice) setPrice(parseFloat(storedPrice));
        if (storedOrderId) setOrderId(storedOrderId);

        // If no order ID, redirect back to checkout
        if (!storedOrderId) {
            toast.error('Pedido não encontrado. Refaça o checkout.');
            router.push('/checkout');
        }
    }, [router]);

    // Gerar QR PIX quando os dados estiverem prontos
    useEffect(() => {
        if (price > 0 && orderId) {
            const username = localStorage.getItem('name') || 'Cliente';
            generatePixCode(username);
        }
    }, [price, orderId]);

    const generatePixCode = async (username) => {
        try {
            // Criar o código PIX usando pix-utils
            const pixData = createStaticPix({
                merchantName: 'SHOPIC',
                merchantCity: 'Salvador',
                pixKey: '85953866500',
                infoAdicional: `Pedido ${orderId}`,
                transactionAmount: price
            });

            console.log('Dados PIX gerados:', pixData);

            // Usar o método toBRCode() para obter o código PIX correto
            const pixCodeString = pixData.toBRCode();

            console.log('Código PIX string:', pixCodeString);

            // Verificar se o código PIX string foi gerado corretamente
            if (!pixCodeString || typeof pixCodeString !== 'string') {
                throw new Error('Não foi possível gerar o código PIX');
            }

            // Definir o código PIX em texto
            setPixCode(pixCodeString);

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
            console.error('Erro ao gerar código PIX:', error);
            toast.error('Erro ao gerar código PIX: ' + error.message);
            
            // Fallback: mostrar mensagem de erro
            setPixCode('Erro ao gerar código PIX');
            setQrBase64('');
        }
    };

    const copyPixCode = async () => {
        try {
            await navigator.clipboard.writeText(pixCode);
            setCopySuccess(true);
            toast.success('Código PIX copiado!');
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            toast.error('Erro ao copiar código PIX');
        }
    };

    const handleReceiptUploadSuccess = () => {
        setReceiptUploaded(true);
        toast.success('Comprovante enviado com sucesso!');
    };

    const handleReceiptUploadError = (error) => {
        toast.error(`Erro no upload: ${error}`);
    };

    const handleCompletePayment = async () => {
        if (!receiptUploaded) {
            toast.error('Por favor, envie o comprovante de pagamento antes de finalizar.');
            return;
        }

        if (!orderId) {
            toast.error('ID do pedido não encontrado.');
            return;
        }

        setIsProcessing(true);

        try {
            const result = await completePaymentWithReceipt(orderId);

            if (result.success) {
                toast.success('Pagamento confirmado! Redirecionando...');

                // Clear localStorage
                localStorage.removeItem('price');
                localStorage.removeItem('orderId');
                localStorage.removeItem('name');

                // Redirect to order status page
                setTimeout(() => {
                    router.push(`/statusPedido/${orderId}`);
                }, 1500);
            } else {
                toast.error(result.error || 'Erro ao processar pagamento.');
            }
        } catch (error) {
            console.error('Payment completion error:', error);
            toast.error('Erro interno. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!orderId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Carregando informações do pedido...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-center mb-6">
                        Pagamento - Pedido #{orderId}
                    </h1>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* PIX Payment Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Pague R$ {price.toFixed(2)} via Pix</h2>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-4">
                                    Escaneie o código QR ou copie o código PIX:
                                </p>

                                <div className="flex justify-center mb-4">
                                    {qrBase64 ? (
                                        <img
                                            src={qrBase64}
                                            alt="QR PIX"
                                            className="max-w-xs border rounded"
                                        />
                                    ) : (
                                        <div className="text-red-500 p-4">PIX INVÁLIDO</div>
                                    )}
                                </div>

                                {/* Código PIX em texto */}
                                {pixCode && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Código PIX (Copia e Cola):
                                        </label>
                                        <div className="flex gap-2">
                                            <textarea
                                                value={pixCode}
                                                readOnly
                                                className="flex-1 p-3 border border-gray-300 rounded-md text-sm font-mono bg-gray-50 resize-none"
                                                rows="3"
                                                placeholder="Código PIX será gerado aqui..."
                                            />
                                            <button
                                                onClick={copyPixCode}
                                                className={`px-4 py-2 rounded-md font-medium transition-colors ${copySuccess
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                    }`}
                                                title="Copiar código PIX"
                                            >
                                                {copySuccess ? '✓ Copiado!' : 'Copiar'}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Cole este código no seu app bancário na opção PIX → Copia e Cola
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-medium text-blue-900 mb-2">Instruções:</h3>
                                <ol className="text-sm text-blue-800 space-y-1">
                                    <li>1. Faça o pagamento via PIX</li>
                                    <li>2. Envie o comprovante ao lado</li>
                                    <li>3. Clique em &quot;Finalizar Pedido&quot;</li>
                                </ol>
                            </div>
                        </div>

                        {/* Receipt Upload Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Enviar Comprovante</h2>

                            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Importante:</strong> Após realizar o pagamento PIX,
                                    envie o comprovante para confirmar seu pedido.
                                </p>
                            </div>

                            <ReceiptUpload
                                orderId={orderId}
                                onUploadSuccess={handleReceiptUploadSuccess}
                                onUploadError={handleReceiptUploadError}
                                required={true}
                            />

                            {receiptUploaded && (
                                <div className="mt-6">
                                    <button
                                        onClick={handleCompletePayment}
                                        disabled={isProcessing}
                                        className={`
                                            w-full py-3 px-6 rounded-lg font-medium transition-colors
                                            ${isProcessing
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700'
                                            } text-white
                                        `}
                                    >
                                        {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {!receiptUploaded && (
                        <div className="mt-8 text-center">
                            <p className="text-gray-600 text-sm">
                                O comprovante é obrigatório para confirmar seu pedido
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}