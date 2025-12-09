
import React, { useState, useRef } from 'react';

interface ImageInputProps {
  id: string;
  label: string;
  onFileChange: (file: File | null) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ id, label, onFileChange }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onFileChange(null);
      setPreview(null);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onFileChange(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md h-48 relative bg-gray-50 dark:bg-gray-800/50">
        {preview ? (
          <>
            <img src={preview} alt="Xem trước" className="max-h-full max-w-full object-contain" />
             <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                aria-label="Xóa ảnh"
            >
                X
            </button>
          </>
        ) : (
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label
                htmlFor={id}
                className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span className="px-1">Tải ảnh lên</span>
                <input ref={fileInputRef} id={id} name={id} type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
              </label>
              <p className="pl-1">hoặc kéo thả</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageInput;
