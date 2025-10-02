import React from 'react';
import Image from 'next/image';
import RenderStars from './stars';

export default function Card(props) {
  console.log(props);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 m-4 flex flex-col items-center h-80 w-64">
      {/* Título com altura fixa e overflow controlado */}
      <div className="h-14 flex items-center justify-center mb-2">
        <h1 className="text-lg font-semibold text-center line-clamp-2 leading-tight">
          {props.name}
        </h1>
      </div>
      
      {/* Container para a imagem com altura fixa */}
      <div className="relative w-40 h-40 mb-3 flex-shrink-0">
        <Image
          src={props.image}
          alt="Product Photo"
          fill={true}
          className="object-contain rounded-md"
        />
      </div>
      
      {/* Container para as estrelas com altura fixa */}
      <div className="h-6 flex items-center justify-center mb-2">
        <RenderStars rating={props.rating}></RenderStars>
      </div>
      
      {/* Container para o preço com altura fixa */}
      <div className="h-6 flex items-center justify-center">
        {props.price && (
          <p className="text-gray-700 text-sm font-medium">
            {typeof props.price.toFixed !== 'undefined' ? "R$" + props.price.toFixed(2) : props.price}
          </p>
        )}
      </div>
    </div>
  );
}