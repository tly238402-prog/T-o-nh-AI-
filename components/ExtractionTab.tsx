import React, { useState, useCallback } from 'react';
import { Part } from "@google/genai";
import ImageInput from './ImageInput';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import { fileToGenerativePart, generateImage } from '../services/geminiService';

interface ExtractionTabProps {
}

type ExtractionMode = 'background' | 'shirt' | 'pants' | 'dress';

const ExtractionTab: React.FC<ExtractionTabProps> = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [mode, setMode] = useState<ExtractionMode>('background');
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = useCallback(async () => {
        if (!imageFile) {
            setError("Vui lòng tải ảnh trang phục gốc.");
            return;
        }

        setLoading(true);
        setError('');
        setResultImage(null);

        try {
            const imagePart = await fileToGenerativePart(imageFile);
            let promptText = '';

            switch(mode) {
                case 'background':
                    promptText = "Từ hình ảnh này, hãy bóc tách chính xác toàn bộ trang phục (quần, áo, váy) và đặt nó trên một nền trắng tinh khiết (#FFFFFF). Giữ nguyên mọi chi tiết, màu sắc và hoa văn. Xóa bỏ người mẫu, giá treo hoặc bất kỳ bối cảnh nào khác. Kết quả phải là hình ảnh chất lượng 4K.";
                    break;
                case 'shirt':
                    promptText = "Từ hình ảnh này, chỉ bóc tách 'cái áo' và đặt nó trên nền trắng tinh khiết (#FFFFFF). Giữ nguyên chi tiết và xóa mọi thứ khác. Kết quả phải là hình ảnh chất lượng 4K.";
                    break;
                case 'pants':
                    promptText = "Từ hình ảnh này, chỉ bóc tách 'cái quần' và đặt nó trên nền trắng tinh khiết (#FFFFFF). Giữ nguyên chi tiết và xóa mọi thứ khác. Kết quả phải là hình ảnh chất lượng 4K.";
                    break;
                case 'dress':
                    promptText = "Từ hình ảnh này, hãy bóc tách chính xác 'cái váy' hoặc 'cái đầm'. Nếu là váy có hoa văn, phải giữ lại toàn bộ chi tiết hoa văn và chất liệu vải một cách rõ nét nhất. Đặt kết quả lên nền trắng tinh khiết (#FFFFFF). Kết quả phải là hình ảnh chất lượng 4K.";
                    break;
            }
            
            const parts: Part[] = [imagePart, { text: promptText }];
            const images = await generateImage('gemini-2.5-flash-image', parts);
            
            if (images.length > 0) {
                setResultImage(images[0]);
            }

        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("Đã có lỗi không xác định xảy ra.");
            }
        } finally {
            setLoading(false);
        }
    }, [imageFile, mode]);

    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = 'ket-qua-boc-tach.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <ImageInput id="extraction-image" label="Tải ảnh trang phục gốc" onFileChange={setImageFile} />
            
            <fieldset>
                <legend className="text-base font-medium text-gray-900 dark:text-gray-100">Chế độ bóc tách</legend>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(['background', 'shirt', 'pants', 'dress'] as ExtractionMode[]).map((m) => (
                        <div key={m} className="flex items-center">
                            <input
                                id={m}
                                name="extraction-mode"
                                type="radio"
                                checked={mode === m}
                                onChange={() => setMode(m)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            />
                            <label htmlFor={m} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {m === 'background' && 'Tách nền'}
                                {m === 'shirt' && 'Chỉ tách Áo'}
                                {m === 'pants' && 'Chỉ tách Quần'}
                                {m === 'dress' && 'Tách Váy/Đầm'}
                            </label>
                        </div>
                    ))}
                </div>
            </fieldset>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
                {loading ? 'Đang xử lý...' : 'Bắt đầu bóc tách'}
            </button>
            
            {loading && <Spinner />}
            {error && <ErrorMessage message={error} />}

            {resultImage && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Kết quả</h3>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <img src={resultImage} alt="Kết quả bóc tách" className="w-full h-auto object-contain" />
                    </div>
                     <button
                        onClick={handleDownload}
                        className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Tải xuống
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExtractionTab;