import React from 'react';
import Image from 'next/image';
import RenderStars, { renderStars } from './stars';

export default function Card(props) {
  console.log(props);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 m-4 flex flex-col items-center">
      <h1 className="text-xl font-semibold mb-2">{props.name}</h1>
      {/* Container para a imagem com uma altura e largura definidas */}
      <div className="relative w-40 h-40 mb-2">
        <Image
          src={props.image}
          alt="Product Photo"
          fill={true} // Use fill para que a imagem preencha o container pai
          className="object-contain" // Use object-contain para a imagem caber inteira
        />
      </div>
      {(
        <div className="flex items-center mt-2">
          <RenderStars rating={props.rating}></RenderStars>
        </div>
      )}
      {
        props.price && (
          <p className="text-gray-700 text-sm">{typeof props.price.toFixed !== 'undefined' ? "R$" + props.price.toFixed(2) : props.price }</p>
        )
      }
    </div>
  );
}