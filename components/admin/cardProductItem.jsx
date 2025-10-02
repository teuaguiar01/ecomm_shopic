import React from 'react';
import RenderStars from '../ui/stars';
import { BookmarkIcon, Trash2Icon } from 'lucide-react';
import Carousel from './carousel';
import { Button } from '@tremor/react';

export default function CardProductItem(props) {
  return (
    <div className="max-w-lg w-full lg:max-w-full lg:flex shadow-lg">
      <Carousel images={props.images} handleDeleteImage={props.handleDelete}>
        {props.images.length > 0 ? (
          <div className="flex space-x-4">
            {props.images.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-20 object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma imagem encontrada.</p>
        )}
      </Carousel>

      <div className="p-6 bg-white rounded-b lg:rounded-b-none lg:rounded-r flex flex-col justify-between leading-normal">
        <div className="flex justify-between items-start">
          <h3 className='text-2xl font-bold border-b-zinc-600 border-b text-sky-900'>Produto</h3>
          {props.onDeleteProduct && (
            <Button
              onClick={props.onDeleteProduct}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
              title="Deletar Produto"
            >
              <Trash2Icon size={16} />
            </Button>
          )}
        </div>
        {props.rating && (
          <div className="flex items-center mt-2 text-black">
            <RenderStars rating={props.rating} />
          </div>
        )}
        <div className="text-gray-900 font-bold text-xl mb-2">{props.name}</div>
        <p className="text-gray-700 text-base">{props.description}</p>
        <p className="text-gray-500 text-base flex mt-3"><BookmarkIcon />{props.categorie}</p>
      </div>
    </div>
  );
}
