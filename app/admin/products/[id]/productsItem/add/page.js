"use client"
import React, { useEffect, useState, useTransition } from 'react';
import { queryProductById, queryAllProductsItem, queryAllCategories, updateProductItem, deleteProduct } from "../../../actions"
import ReturnComponent from '@/components/ui/insertProduct';
import { ref, getDownloadURL, listAll, deleteObject} from "@firebase/storage";
import { storage } from "@/firebase";

const EditProduct = ({ params }) => {
  const [productsItem, setProductsItem] = useState([]);
  const [firstProduct, setFirstProduct] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categorie, setCategorie] = useState([]);
  const [isPending,startTransition] = useTransition();
  const [imageURLs, setImageURLs] = useState([]);
  
  const getAllImageURLs = async () => {
    const folderRef = ref(storage, `${params.id}`);
    const images = await listAll(folderRef);
    
    const imageURLs = await Promise.all(
      images.items.map(async (imageRef) => {
        return getDownloadURL(imageRef);
      })
      );
      
    return imageURLs;
  };
  
  const handleDeleteImage = async (index) => {
    const updatedImages = [...imageURLs];
    const imageToDelete = updatedImages[index];
    
    try {
      const storageRef = ref(storage, imageToDelete);
  
      deleteObject(storageRef);
      
      updatedImages.splice(index, 1);
      setImageURLs(updatedImages);
    } catch (error) {
      console.error('Erro ao excluir a imagem:', error.message);
    }
  };
  
  
  useEffect(() => {
    if(!isPending){
      startTransition(async () => {
        const productsItem = await queryAllProductsItem(params.id);
        setProductsItem(productsItem);

          const product = await queryProductById(params.id);
          const firstProduct = product[0];
          setFirstProduct(firstProduct);
          
          const imageURLs = await getAllImageURLs();
          setImageURLs(imageURLs);

          let categorie = ""
          const categorie_vector = await queryAllCategories();
          categorie_vector.forEach(el => {
            fieldsProductupdate[3].options.push({ "id": el.id, "name": el.name })
            if (firstProduct.product_categories_id == el.id)
              setCategorie(el.name);
          });
          setCategories(categorie_vector);

      })
    }
  },[])

  const headers = ["SKU", "Preço", "Tamanho", "Estoque", "Ação"];

  const fieldsProductupdate = [
    {
      "name": "id",
      "value": firstProduct.id,
      "type": "hidden",
    },
    {
      "name": "productName",
      "label": "Nome do Produto",
      "value": firstProduct.name,
    },
    {
      "name": "description",
      "label": "Descrição",
      "type": "textarea",
      "value": firstProduct.description,
    },
    {
      "name": "category",
      "label": "Categoria",
      "type": "select",
      "value": firstProduct.product_categories_id,
      "options": categories, 
    },
  ];

  const fieldsItem = [
    {
      "name": "sku",
      "label": "SKU",
      "type": "text",
    },
    {
      "name": "size",
      "label": "Tamanho",
      "type": "text",
    },
    {
      "name": "amount",
      "label": "Quantidade",
      "type": "number",
    },
    {
      "name": "price",
      "label": "Preço",
      "type": "number",
    },
    {
      "name": "product_id",
      "value": params.id,
      "type": "hidden",
    },
  ];

  const dados = { firstProduct, fieldsProductupdate, fieldsItem, headers, productsItem, imageURLs, handleDeleteImage, action: updateProductItem, categorie};

  return (
    <div>
      <ReturnComponent dados={dados} ></ReturnComponent>
    </div>
  );
};
  
export default EditProduct;