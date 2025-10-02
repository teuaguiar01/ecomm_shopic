'use client'
import React from 'react';
import { AdminForm } from "@/components/admin/adminForm"
import { AdminTable } from "@/components/admin/adminTable"
import CardProductItem from '../admin/cardProductItem';
import Image from 'next/image'
import RenderStars from '@/components/ui/stars';
import EditableTable from "@/components/admin/editableTable/editableTable";
import { createProductItem, updateProduct, queryProductById, queryAllProducts, queryAllProductsItem, queryProductCategory } from "@/app/admin/products/actions"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { toast } from 'react-toastify';
import UploadImagePage from '@/components/admin/uploadImage';
import EditableProductTable from '../admin/editableTable/editableProductTable';

const ReturnComponent = ({ dados }) => {
    const handleFormSubmit = async (formValues) => {
      try {
        const retornoProduto = await createProductItem(formValues);

        if(retornoProduto.success=== true){
        toast.success(retornoProduto.message);
        setTimeout(() => {
          window.location.reload();
        }, 1000); 
      }  
      else
      toast.error(retornoProduto.message);
      } catch (error) {
        toast.error("Houve um erro durante a criação do produto");
      }
    };

    const handleUpdateProduct = async (formValues) => {
    console.log("🚀 ~ file: insertProduct.jsx:34 ~ handleUpdateProduct ~ formValues:", formValues)
      try {
        const res = await updateProduct(formValues)
        if (res)
          toast.success("Produto atualizado com sucesso")
        else
          toast.error("Falha ao atualizar produto")
      } catch (error) {
        toast.error("Falha ao atualizar produto")
      }
    }

    const handleDeleteProduct = async () => {
      if (!window.confirm("Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.")) {
        return;
      }

      try {
        const response = await fetch('/api/delete-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId: dados.firstProduct.id })
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Produto deletado com sucesso");
          setTimeout(() => {
            window.location.href = '/admin/products';
          }, 1500);
        } else {
          toast.error(result.error || "Erro ao deletar produto");
        }
      } catch (error) {
        console.error("Erro ao deletar produto:", error);
        toast.error("Erro ao deletar produto");
      }
    };
  
  const { firstProduct, fieldsProductupdate, fieldsItem, headers, productsItem, action, categorie , imageURLs, handleDeleteImage} = dados;
  
  return (
    <div className="py-3 px-2 self-center grow flex flex-col items-center gap-4 text-white">
      <ToastContainer position="top-right" autoClose={3000} />

    {/* Primeira linha */}
    <div className="flex flex-col md:flex-row gap-4 w-full">


      {/* Card */}
      <div className="flex flex-col w-full md:w-2/3 bg-white shadow-lg rounded-lg">
          <CardProductItem
            key={firstProduct.id}
            name={firstProduct.name}
            images={imageURLs}
            description={firstProduct.description}
            rating={firstProduct.rating}
            categorie={categorie}
            handleDelete={handleDeleteImage}
            onDeleteProduct={handleDeleteProduct}
            />
      </div>

      {/* Upload Image */}
      <div className="w-full h-auto md:w-1/3 bg-white shadow-lg rounded-lg">
        <UploadImagePage firstProductId={dados.firstProduct.id}/>
      </div>

    </div>

    {/* Segunda linha */}
    <div className="flex flex-col md:flex-row gap-4 w-full">

      {/* Primeiro Admin Form */}
      <div className="flex justify-center items-center w-full md:w-2/3">
        <AdminForm formTitle="Editar Produto" onSubmit={handleUpdateProduct} fields={fieldsProductupdate} buttonLabel="Salvar" />
      </div>

      {/* Segundo Admin Form */}
      <div className="flex justify-center items-center w-full md:w-1/3">
        <AdminForm formTitle="Adicionar Itens"  fields={fieldsItem} buttonLabel="Adicionar" onSubmit={handleFormSubmit} />
      </div>

    </div>

    {/* Terceira linha */}
    <div className="flex flex-col w-full">

      {/* Editable */}
      <div className="flex justify-center items-center w-full">
      <div className="w-full overflow-x-auto">
          <EditableProductTable
            title="Sub-produtos"
            headers={headers}
            data={productsItem}
            action={action}
          />
        </div>
      </div>

    </div>

  </div>
  
  );
};

export default ReturnComponent;