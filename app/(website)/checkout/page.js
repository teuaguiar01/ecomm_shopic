'use client';

import React, { startTransition, useEffect, useState, useCallback } from 'react'
import ProductList from '@/components/order/productList';
import RadioButton from '@/components/order/radioButton';
import { CreditCardIcon } from "lucide-react";
import { useCart } from '@/components/CartContext';
import { GetAddressesFromUserId, createOrder, redirectToStatusPage } from './actions';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-toastify';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GeneratePayment } from '../payment/actions';

const CheckoutPage = () => {
    const { data: session, status } = useSession()
    const [fullField, setFullField] = useState(false);
    const [productImage, setProductImage] = useState(null);
    const router = useRouter();
    const [userCpf, setUserCpf] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [multipleAddresses, setMultipleAddresses] = useState(false);

    const checkFields = useCallback(() => {
        // Campos obrigatórios do endereço de cobrança
        const billingFields = ['zipCode', 'city', 'state', 'country', 'neighborhood', 'complement', 'number', 'street', 'full_name', 'user_cpf', 'user_phone']; 
        
        const billingValid = billingFields.every(field => {
            const element = document.getElementById(field);
            return element && (element.value.trim() !== '' || element.defaultValue.trim() !== '');
        });

        // Se há endereços múltiplos, verificar também os campos de entrega
        let shippingValid = true;
        if (multipleAddresses) {
            const shippingFields = ['shipping_zipCode', 'shipping_city', 'shipping_state', 'shipping_country', 'shipping_neighborhood', 'shipping_complement', 'shipping_number', 'shipping_street', 'shipping_full_name'];
            shippingValid = shippingFields.every(field => {
                const element = document.getElementById(field);
                return element && (element.value.trim() !== '' || element.defaultValue.trim() !== '');
            });
        }

        const allValid = billingValid && shippingValid;
        setFullField(allValid);
    }, [multipleAddresses]);

    const handleChange = () => {
        checkFields();
    };

    const handleAddressChange = (field, value) => {
        setAddress(prev => ({
            ...prev,
            [field]: value
        }));
        checkFields();
    };

    const handleSubmit = (e) => {
        if (fullField) {
          document.getElementById('order').submit();
        } else {
          console.log('Preencha todos os campos!');
        }
    };

    const paymentOptions = [
        { label: 'Pix', icon: <CreditCardIcon />, description: 'Pague com Pix a qualquer momento!' },
        { label: 'Cartão de Crédito', icon: <CreditCardIcon />, },
        { label: 'Boleto Bancário', icon: <CreditCardIcon />, },
    ]

    const { cartItems, cartTotal, removeFromCart, clearCart } = useCart()
    const [address, setAddress] = useState({
        type: "",
        name: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        country: "",
        zip_code: "",
    })

    const [address2, setAddress2] = useState({
        type: "",
        street: "",
        name: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        country: "",
        zip_code: "",
    })

    const [selectedOption, setSelectedOption] = useState(paymentOptions[0].label)

    const onValueChange = (event) => {
        setSelectedOption(event.currentTarget.value)
    }

    const redirectToStatusPage2 = (orderId) => {
        // Save order ID for payment page
        console.log('Redirecionando para pagamento, orderId:', orderId)
        localStorage.setItem('orderId', orderId);
        localStorage.setItem('price', cartTotal);
        
        // Usar window.location.href para garantir o redirecionamento
        window.location.href = '/payment';
    };
    async function tryCreateOrder() {
        // Validar CPF e telefone antes de criar o pedido
        if (!userCpf || !userPhone) {
            toast.error('Por favor, preencha seu CPF e telefone.')
            return;
        }

        console.log('Criando pedido com dados:', {
            user: session.user.id,
            billing_address: address,
            cpf: userCpf,
            phone: userPhone
        })

        let res = await createOrder({ 
            user: session.user.id, 
            billing_address: address, 
            shipping_same_as_billing: !multipleAddresses, 
            shipping_address: address2, 
            gateway: { name: selectedOption }, 
            cart: cartItems, 
            total: cartTotal,
            cpf: userCpf,
            phone: userPhone
        })
        
        console.log('Resposta do createOrder:', res)
        
        if (res) {
            if (res.order) {
                console.log('Pedido criado com sucesso, ID:', res.order.id)
                toast.success('Pedido criado com sucesso!')
                cartItems.forEach(elemento => {
                    removeFromCart(elemento.item.sku);
                });
                clearCart()


                redirectToStatusPage2(res.order.id)
            } else if (res.error) {
                toast.error('Erro ao criar o pedido. ' + res.error)
            } else {
                toast.error('Erro desconhecido ao criar o pedido. ' + res)
            }
        } else
            toast.error('Erro desconhecido ao criar o pedido.')
    }

    useEffect(() => {
        if (session?.user?.id) {
            setUserCpf(session?.user.cpf || '')
            setUserPhone(session?.user.phone || '')
            startTransition(() => {
                GetAddressesFromUserId(session.user.id).then((res) => {
                    res.forEach(el => {
                        if (el)
                            el.name = session?.user.name
                        if (el?.type === 'billing')
                            setAddress(el)
                        else if (el?.type === 'shipping')
                            setAddress2(el)
                        else if (el?.type === 'billing_shipping') {
                            setAddress(el)
                            setAddress2(el)
                        }
                    });
                    setTimeout(() => checkFields(), 500);
                })
            })
        }
    }, [session?.user?.id, session?.user?.cpf, session?.user?.phone, session?.user?.name, checkFields])

    // Revalidar quando multipleAddresses mudar
    useEffect(() => {
        setTimeout(() => checkFields(), 100);
    }, [multipleAddresses, checkFields])

    if (status === "unauthenticated") {
        return (
            <div className='flex my-10'>
                <div className="max-w-xl mx-auto bg-white rounded-lg p-8 border flex flex-col items-center gap-4">
                    <p>Você precisa criar uma conta para finalizar seu pedido</p>
                    <button onClick={() => signIn()} className='flex border rounded-lg w-max px-4 py-2 bg-black text-white border-black duration-300 hover:bg-transparent hover:text-black'>Criar conta e fazer login</button>
                </div>
            </div>
        )
    }

    const formattedCartTotal = cartTotal ? cartTotal.toFixed(2) : Number(0).toFixed(2);

    const handleRedirectToPayment = async() => {
        const paymentUrl = await GeneratePayment(formattedCartTotal, address.name);
        console.log('Redirecionando para o pagamento:', paymentUrl);
        if (paymentUrl) {
            window.location.href = paymentUrl; // Redirect to the payment URL
        }
    };
    return (
        <>
            <div className="text-center font-bold text-2xl mb-4 mt-4">
                <h2>Revise seu pedido</h2>
            </div>
            
            <div className="max-w-screen-xl mx-auto flex p-4 w-full">
                <div className="w-3/4">
                    {/* Endereço */}
                    <div className="mb-4">
                        <div className="bg-white p-4 rounded shadow">

                            <form className="space-y-4" id="order" action={tryCreateOrder}>

                                <h2 className="text-lg font-semibold mb-2">Endereço de cobrança{multipleAddresses ? "" : " e Entrega"}</h2>

                                <div>
                                    <div className="my-2 block">
                                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                                            Nome Completo
                                        </label>
                                        <input
                                            type="text"
                                            id="full_name"
                                            name="name"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            value={address.name}
                                            onChange={(e) => handleAddressChange('name', e.target.value)}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="user_cpf" className="block text-sm font-medium text-gray-700">
                                            CPF <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="user_cpf"
                                            name="cpf"
                                            placeholder="000.000.000-00"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            value={userCpf}
                                            onChange={(e) => {
                                                setUserCpf(e.target.value);
                                                handleChange();
                                            }}
                                            required
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="user_phone" className="block text-sm font-medium text-gray-700">
                                            Telefone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="user_phone"
                                            name="phone"
                                            placeholder="(00) 00000-0000"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            value={userPhone}
                                            onChange={(e) => {
                                                setUserPhone(e.target.value);
                                                handleChange();
                                            }}
                                            required
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                                            Logradouro
                                        </label>
                                        <input
                                            type="text"
                                            id="street"
                                            name="street"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            value={address.street}
                                            onChange={(e) => handleAddressChange('street', e.target.value)}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                                            Número
                                        </label>
                                        <input
                                            type="text"
                                            id="number"
                                            name="number"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            value={address.number}
                                            onChange={(e) => handleAddressChange('number', e.target.value)}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="complement" className="block text-sm font-medium text-gray-700">
                                            Complemento
                                        </label>
                                        <input
                                            type="text"
                                            id="complement"
                                            name="complement"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            value={address.complement}
                                            onChange={(e) => handleAddressChange('complement', e.target.value)}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">
                                            Bairro
                                        </label>
                                        <input
                                            type="text"
                                            id="neighborhood"
                                            name="neighborhood"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            value={address.neighborhood}
                                            onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                            Cidade
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            value={address.city}
                                            onChange={(e) => handleAddressChange('city', e.target.value)}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                            Estado
                                        </label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            value={address.state}
                                            onChange={(e) => handleAddressChange('state', e.target.value)}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                            País
                                        </label>
                                        <input
                                            type="text"
                                            id="country"
                                            name="country"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            value={address.country}
                                            onChange={(e) => handleAddressChange('country', e.target.value)}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                                            CEP
                                        </label>
                                        <input
                                            type="text"
                                            id="zipCode"
                                            name="zipCode"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            value={address.zip_code}
                                            onChange={(e) => handleAddressChange('zip_code', e.target.value)}
                                        />
                                    </div>
                                </div>


                            </form>
                        </div>
                    </div>

                    <div className="mb-4 bg-white p-4 rounded shadow">
                        <label htmlFor="multipleaddresses" className="block text-sm font-medium text-gray-700 mb-1">
                            Endereço de <strong>entrega diferente</strong> do endereço de cobrança?
                        </label>
                        <Switch
                            id="multipleaddresses"
                            value={multipleAddresses}
                            checked={multipleAddresses}
                            onCheckedChange={e => setMultipleAddresses(e)}
                        />
                    </div>

                    {(multipleAddresses) &&
                        (<><div className="mb-4">
                            <div className="bg-white p-4 rounded shadow">
                                <h2 className="text-lg font-semibold mb-2">Endereço de entrega</h2>

                                <div>
                                    <div className="my-2 block">
                                        <label htmlFor="shipping_full_name" className="block text-sm font-medium text-gray-700">
                                            Nome Completo
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_full_name"
                                            name="shipping_name"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            defaultValue={address2.name}
                                            form="order"
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="shipping_street" className="block text-sm font-medium text-gray-700">
                                            Logradouro
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_street"
                                            name="shipping_street"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            defaultValue={address2.street}
                                            form="order"
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="shipping_number" className="block text-sm font-medium text-gray-700">
                                            Número
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_number"
                                            name="shipping_number"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            defaultValue={address2.number}
                                            form="order"
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="shipping_complement" className="block text-sm font-medium text-gray-700">
                                            Complemento
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_complement"
                                            name="shipping_complement"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            defaultValue={address2.complement}
                                            form="order"
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="shipping_neighborhood" className="block text-sm font-medium text-gray-700">
                                            Bairro
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_neighborhood"
                                            name="shipping_neighborhood"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            defaultValue={address2.neighborhood}
                                            form="order"
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="shipping_city" className="block text-sm font-medium text-gray-700">
                                            Cidade
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_city"
                                            name="shipping_city"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            defaultValue={address2.city}
                                            form="order"
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="shipping_state" className="block text-sm font-medium text-gray-700">
                                            Estado
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_state"
                                            name="shipping_state"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            defaultValue={address2.state}
                                            form="order"
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="shipping_country" className="block text-sm font-medium text-gray-700">
                                            País
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_country"
                                            name="shipping_country"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            defaultValue={address2.country}
                                            form="order"
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="my-2 block">
                                        <label htmlFor="shipping_zipCode" className="block text-sm font-medium text-gray-700">
                                            CEP
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_zipCode"
                                            name="shipping_zipCode"
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 sm:text-sm"
                                            defaultValue={address2.zip_code}
                                            form="order"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div></>)
                    }

                    {/* Métodos de Pagamento */}
                    {/* <div className="mb-4">
                        <div className="bg-white p-4 rounded shadow">
                            <h2 className="text-lg font-semibold mb-2">Métodos de Pagamento</h2>

                            {paymentOptions.map((option, index) => {
                                return (
                                    <RadioButton
                                        key={index}
                                        icon={option.icon}
                                        label={option.label}
                                        description={option.description}
                                        checked={selectedOption === option.label}
                                        onChange={onValueChange}
                                    />)
                            })}
                        </div>
                    </div> */}

                    {/* Lista de Itens */}
                    <div className="bg-white p-4 rounded shadow">
                        {cartItems.length > 0 ?
                            cartItems.map((el, index) => {
                                return (
                                    <ProductList
                                        key={index}
                                        name={el.product.name}
                                        size={el.item.size}
                                        price={el.item.price}
                                        quantity={el.quantity}
                                        productId={el.product.id}
                                    />
                                );
                            }) : <h1 className='text-center'>Carrinho Vazio</h1>
                        }

                    </div>
                </div>

                {/* Resumo */}
                <div className="w-1/4 pr-4">
                    <div className="bg-gray-200 p-4 rounded  ml-10">

                        <h2 className="text-lg font-semibold mb-2 text-center">Resumo</h2>

                        <div className="border-b border-gray-600">
                            <div className="flex w-full my-4">
                                <div className="w-1/2 text-left">
                                    Subtotal:
                                </div>
                                <div className="w-1/2 text-right">
                                    R$ {cartTotal ? cartTotal.toFixed(2) : Number(0).toFixed(2)}
                                </div>
                            </div>

                            <div className="flex w-full my-4">
                                <div className="w-1/2 text-left">
                                    Total:
                                </div>
                                <div className="w-1/2 text-right">
                                    R$ {cartTotal ? cartTotal.toFixed(2) : Number(0).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className={`w-full rounded-full my-4 py-2 px-4 ${fullField ? 'bg-blue-500' : 'bg-gray-300'}`}
                            disabled={!fullField}
                            onClick={async (e) => {
                                e.preventDefault();
                                // Save payment data before creating order
                                localStorage.setItem('price', formattedCartTotal);
                                localStorage.setItem('name', address.name);
                                await tryCreateOrder(); // This will redirect to payment page
                            }}
                        >
                            Fazer Pedido
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckoutPage;