"use client";
import { useState, useEffect } from "react";
import { ref, uploadBytes } from "@firebase/storage";
import { storage } from "@/firebase";
import { useDropzone } from "react-dropzone";
import { UploadCloudIcon, Trash2Icon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";

const ReceiptUpload = ({ 
  orderId, 
  onUploadSuccess, 
  onUploadError, 
  required = true 
}) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Formato inválido. Use apenas JPG, PNG ou WebP";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Arquivo muito grande. Tamanho máximo: 5MB";
    }
    return null;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"]
    },
    onDrop: (acceptedFiles, rejectedFiles) => {
      // Clear previous states
      setError(null);
      setUploadComplete(false);
      
      if (rejectedFiles.length > 0) {
        setError("Arquivo rejeitado. Verifique o formato e tamanho.");
        return;
      }

      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        const validationError = validateFile(selectedFile);
        
        if (validationError) {
          setError(validationError);
          return;
        }

        // Revoke previous preview URL
        if (file?.preview) {
          URL.revokeObjectURL(file.preview);
        }

        const fileWithPreview = Object.assign(selectedFile, {
          preview: URL.createObjectURL(selectedFile),
        });
        
        setFile(fileWithPreview);
      }
    },
  });

  const removeFile = () => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(null);
    setError(null);
    setUploadComplete(false);
    setUploadProgress(0);
  };

  const uploadReceipt = async () => {
    if (!file || !orderId) {
      setError("Arquivo ou ID do pedido não encontrado");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Create file reference in Firebase Storage
      const fileExtension = file.name.split('.').pop();
      const fileName = `receipt.${fileExtension}`;
      const storageRef = ref(storage, `receipts/${orderId}/${fileName}`);

      // Upload file
      await uploadBytes(storageRef, file);

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadComplete(true);
      
      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      setError("Erro no upload. Tente novamente.");
      
      if (onUploadError) {
        onUploadError(uploadError.message);
      }
    } finally {
      setUploading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  return (
    <div className="w-full max-w-md mx-auto">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Comprovante de Pagamento {required && <span className="text-red-500">*</span>}
      </label>
      
      {!uploadComplete ? (
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {!file ? (
            <div className="space-y-2">
              <UploadCloudIcon className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive 
                  ? "Solte o arquivo aqui..." 
                  : "Clique ou arraste o comprovante aqui"
                }
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG ou WebP (máx. 5MB)
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={file.preview}
                  alt="Preview do comprovante"
                  className="w-32 h-32 object-cover mx-auto rounded border"
                  onLoad={() => URL.revokeObjectURL(file.preview)}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 truncate">{file.name}</p>
              
              {uploading ? (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">Enviando... {uploadProgress}%</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    uploadReceipt();
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Enviar Comprovante
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6 text-center">
          <CheckCircleIcon className="w-8 h-8 mx-auto text-green-600 mb-2" />
          <p className="text-sm text-green-700 font-medium">
            Comprovante enviado com sucesso!
          </p>
          <button
            type="button"
            onClick={removeFile}
            className="mt-2 text-xs text-green-600 hover:text-green-800 underline"
          >
            Enviar outro arquivo
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600">
          <AlertCircleIcon className="w-4 h-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ReceiptUpload;