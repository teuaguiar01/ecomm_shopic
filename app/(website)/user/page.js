"use client"
import React, { useEffect, useState, useTransition } from 'react';
import { updateUser } from './actions';
import UserOrders from "@/app/(website)/user/userOrders"
import { useSession, signIn } from 'next-auth/react'
import { toast } from 'react-toastify';
import { getUserAddressById } from './actions';

const ProfileEditComponent = ({ params }) => {
  const [formData, setFormData] = useState({});
  const [address,setAddress] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    
    setAddress(prevAddress => ({
      ...prevAddress,
      [name]: value
    }));
    
  }

  const [isPending, startTransision] = useTransition()

  const { data: session, status } = useSession()

  const loadData = async () => {
    const address = await getUserAddressById();
    
    if(address) setAddress(address)

  }

  
  useEffect(() => {
    if (session) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        cpf: session.user.cpf || '',
        phone: session.user.phone || ''
      })
    }
  }, [session])

  useEffect(() => {
    loadData();
    
  }, []);

  const handleOnSave = (e) => {
    if (!isPending) {
      startTransision(async () => {
      
        const res = await updateUser(formData,address)
        if (res) {
          toast.success("Perfil atualizado com sucesso")
          // Recarregar a sessão para atualizar os dados
          window.location.reload()
        } else {
          toast.error("Erro ao atualizar o seu perfil")
        }
      })
    }
  }


  if (status == "authenticated") {

    return (
      <div className='flex flex-col lg:flex-row my-10 gap-4 max-w-7xl w-full mx-auto px-4'>
        <div className="w-full lg:w-auto lg:max-w-md bg-white rounded-lg p-8 border flex-shrink-0">
          <h1 className="text-2xl mb-4 text-bold">Editar Conta</h1>

          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Nome:</label>
            <input
              type="text"
              id="username"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border rounded py-2 px-3 w-full focus:outline-none focus:border-blue-400"
              required
              disabled={isPending}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border rounded py-2 px-3 w-full focus:outline-none focus:border-blue-400"
              required
              disabled
            />
          </div>

          <div className="mb-4">
            <label htmlFor="cpf" className="block text-gray-700 text-sm font-bold mb-2">CPF:</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf || ''}
              onChange={handleChange}
              placeholder="000.000.000-00"
              className="border rounded py-2 px-3 w-full focus:outline-none focus:border-blue-400"
              required
              disabled={isPending}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Telefone:</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className="border rounded py-2 px-3 w-full focus:outline-none focus:border-blue-400"
              required
              disabled={isPending}
            />
          </div>

         
          <div className="mb-4">
            <label htmlFor="street" className="block text-gray-700 text-sm font-bold mb-2">Logradouro</label>
            <input
              type="text"
              name="street"
              value={address.street}
              onChange={handleAddressChange}
              className="border rounded py-2 px-3 w-full focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="complement" className="block text-gray-700 text-sm font-bold mb-2">Número</label>
            <input
              type="text"
              name="number"
              value={address.number}
              onChange={handleAddressChange}
              className="border rounded py-2 px-3 w-full focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="complement" className="block text-gray-700 text-sm font-bold mb-2">Complemento</label>
            <input
              type="text"
              name="complement"
              value={address.complement}
              onChange={handleAddressChange}
              className="border rounded py-2 px-3 w-full focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="neighborhood" className="block text-gray-700 text-sm font-bold mb-2">Bairro</label>
            <input
              type="text"
              name="neighborhood"
              value={address.neighborhood}
              onChange={handleAddressChange}
              className="border rounded py-2 px-3 w-full focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="zipCode" className="block text-gray-700 text-sm font-bold mb-2">Cidade</label>
            <input
              type="text"
              name="city"
              value={address.city}
              onChange={handleAddressChange}
              className="border rounded py-2 px-3 w-full focus:outline-none focus:border-blue-400"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="state" className="block text-gray-700 text-sm font-bold mb-2">Estado</label>
            <input
              type="text"
              name="state"
              value={address.state}
              onChange={handleAddressChange}
              className="border rounded py-2 px-3 w-full focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="zipCode" className="block text-gray-700 text-sm font-bold mb-2">País</label>
            <input
              type="text"
              name="country"
              value={address.country}
              onChange={handleAddressChange}
              className="border rounded py-2 px-3 w-full focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="zip_code" className="block text-gray-700 text-sm font-bold mb-2">CEP</label>
            <input
              type="text" 
              name="zip_code"
              value={address.zip_code}
              onChange={handleAddressChange}
              className="border rounded py-2 px-3 w-full focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className='flex justify-center mt-8'>
            <button className="flex border rounded-lg w-max px-4 py-2 bg-black text-white border-black duration-300 hover:bg-transparent hover:text-black" onClick={handleOnSave} type="submit" disabled={isPending}>Salvar</button>
          </div>

        </div>
       
        <div className="w-full bg-white rounded-lg p-8 border overflow-hidden">
          <UserOrders userId={session.user.id} className={""}/>
        </div>
      </div>

    );
  } else if (status == "unauthenticated") {
    return (
      <div className='flex my-10'>
        <div className="max-w-md mx-auto bg-white rounded-lg p-8 border flex flex-col items-center gap-4">
          <p>Você precisa estar logado para ver seus pedidos</p>
          <button onClick={() => signIn()} className='flex border rounded-lg w-max px-4 py-2 bg-black text-white border-black duration-300 hover:bg-transparent hover:text-black'>Login</button>
        </div>
      </div>
    )
  }


};

export default ProfileEditComponent;
