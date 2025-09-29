"use client";
import { useState, useEffect, useTransition } from "react";
import { queryProductById, sharpImage } from "@/app/admin/products/actions";
import { ref, uploadBytes, listAll, deleteObject} from "@firebase/storage";
import { storage } from "@/firebase";
import { useDropzone } from "react-dropzone";
import { UploadCloudIcon, Trash2Icon, Edit2Icon, ImageIcon} from "lucide-react";
import { toast } from 'react-toastify';

const UploadImagePage = ({ firstProductId, maxImages = 3 }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [imageURLs, setImageURLs] = useState([]);
  const [isPending,startTransition] = useTransition();

  const { getRootProps, getInputProps } = useDropzone({
    multiple: true,
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
      const newFiles = [...files, ...acceptedFiles].map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setFiles(newFiles);
    },
  });

  function removeFile(index) {
    setFiles(files.filter((e, idx)=> idx !== index))
  }

  const thumbs = files.map((file, idx) => (
    <div
      className="flex w-full justify-between items-center"
      key={idx}
    >
      <div className="flex border border-slate-400 border-r-2 ">
        <img
          src={file.preview}
          className="w-[100px] h-[100px]"
          alt="imagem aqui"
          // Revoke data uri after image is loaded
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
      <p className="px-5">{file.name}</p>
      <button className="px-5" onClick={() => removeFile(idx)}><Trash2Icon className="text-red-300"/></button>
    </div>
  ));

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  },[])
  
  const uploadImages = async () => {
    try {
      console.log("Iniciando o upload das imagens...");

      const folderRef = ref(storage, `${firstProductId}`);

      const images = await listAll(folderRef);

      await Promise.all(images.items.map(async (imageRef) => {
        await deleteObject(imageRef);
      }));

      if (files.length + imageURLs.length > maxImages) {
        setError(`Você pode adicionar no máximo ${maxImages} imagens.`);
        return;
      }

      if (files.length > 0) {
        await Promise.all(
          files.map(async (file) => {
            const fileName = file.name;
            // const filePath = file.path; 
            // const dataToSend = { path: filePath, preview: file.preview, name: fileName};
            // const resizedBuffer = await sharpImage(dataToSend);
            const resizedFile = new File([file], fileName, {
              type: 'jpeg',
            });

            const storageRef = ref(storage, `${firstProductId}/${fileName}`);
            await uploadBytes(storageRef, resizedFile);
          })
        );

        console.log("Imagens enviadas com sucesso.");
        setTimeout(() => {
          window.location.reload();
        }, 1000); 
      } else {
        setError("Erro dentro do envio.");
      }
    } catch (error) {
      setError("Erro ao enviar imagens: " + error.message);
    }
  };

  return (
      <div className="flex h-full items-center justify-center flex-col p-1">
        <label className="text-xl font-bold border-b-zinc-600 border-b text-sky-900 mb-3 flex"><ImageIcon className="mr-1"/> Atualizar Imagens</label>
        <label
          htmlFor="dropzone-file"
          className="flex flex-1 flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
        <section className="text-gray-500 flex flex-col items-center justify-center p-5 pb-6 w-full">
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <p className="mb-4 text-gray-500 dark:text-gray-400 flex justify-center">
              <UploadCloudIcon className="w-8 h-8 mb-4 mx-2 text-gray-500 dark:text-gray-400" />
              Clique aqui ou arraste e solte até 3 imagens<br/>Envie imagens de 500x500 pixels apenas
            </p>
          </div>
          <aside className="space-y-2 overflow-y-auto max-h-[200px]">{thumbs}</aside>
        </section>
        <div className="px-5 grid justify-items-center">
        <button
          className="mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          type="button"
          onClick={uploadImages}
        >
          Substituir as Imagens
        </button>
        </div>
      </label>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default UploadImagePage;
