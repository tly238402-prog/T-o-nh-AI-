import React, { useState, useCallback } from 'react';
import { Part } from "@google/genai";
import ImageInput from './ImageInput';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import { AspectRatio } from '../types';
import { fileToGenerativePart, generateImage } from '../services/geminiService';

interface PerspectiveTabProps {
}

const PerspectiveTab: React.FC<PerspectiveTabProps> = () => {
    const [outfitFile, setOutfitFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
    const [imageCount, setImageCount] = useState<number>(1);
    const [resultImages, setResultImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = useCallback(async () => {
        if (!outfitFile) {
            setError("Vui lòng tải ảnh trang phục tham chiếu.");
            return;
        }
        if (!description) {
            setError("Vui lòng mô tả bối cảnh mới.");
            return;
        }
        
        setLoading(true);
        setError('');
        setResultImages([]);

        try {
            const outfitPart = await fileToGenerativePart(outfitFile);
            const promptText = `Hãy tạo ra ${imageCount} hình ảnh siêu thực (photorealistic), chất lượng 4K, tuân thủ nghiêm ngặt các yêu cầu sau:
1.  **Trang phục**: Lấy trang phục từ hình ảnh tham chiếu. Phải sao chép chính xác 100% mọi chi tiết, hoa văn, màu sắc và chất liệu vải.
2.  **Bối cảnh & Mô tả**: Đặt trang phục đó vào bối cảnh được mô tả chi tiết như sau: "${description}".
3.  **Bố cục**: Đối tượng chính (người mẫu mặc trang phục hoặc trang phục được trưng bày) phải được đặt ở vị trí trung tâm của khung hình để thu hút sự chú ý.
4.  **Tính chân thực & Ánh sáng**:
    - Hòa trộn trang phục vào bối cảnh một cách hoàn toàn tự nhiên, không có dấu hiệu cắt ghép.
    - Ánh sáng từ môi trường phải ảnh hưởng chân thực lên trang phục, tạo ra các vùng sáng và bóng đổ phù hợp. Ví dụ, nếu bối cảnh là ngoài trời nắng, phải có bóng đổ rõ nét trên mặt đất.
    - Các nếp gấp, hình dáng của trang phục phải tự nhiên và phù hợp với cách nó được đặt trong bối cảnh (ví dụ: treo trên móc, gấp trên ghế, hoặc có người mặc).
5.  **Chất lượng cuối cùng**: Hình ảnh phải sắc nét, có chiều sâu, và đạt chất lượng của một bức ảnh quảng cáo thời trang chuyên nghiệp.`;
            
            const parts: Part[] = [outfitPart, { text: promptText }];
            const images = await generateImage('gemini-2.5-flash-image', parts, aspectRatio);

            setResultImages(images);

        } catch (e) {
             if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("Đã có lỗi không xác định xảy ra.");
            }
        } finally {
            setLoading(false);
        }
    }, [outfitFile, description, aspectRatio, imageCount]);

    const handleDownload = (image: string, index: number) => {
        const link = document.createElement('a');
        link.href = image;
        link.download = `ket-qua-goc-nhin-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <ImageInput id="perspective-image" label="Tải ảnh trang phục tham chiếu" onFileChange={setOutfitFile} />
            
            <div>
                <label htmlFor="perspective-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả bối cảnh mới</label>
                <textarea
                    id="perspective-description"
                    rows={3}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="trang phục được treo trên giá gỗ trong phòng, gấp gọn trên bàn, góc nhìn từ phía sau, người mẫu mặc đi dạo trên phố..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                     <label htmlFor="aspect-ratio-perspective" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chọn tỉ lệ ảnh</label>
                     <select
                        id="aspect-ratio-perspective"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600"
                    >
                        <option value="1:1">Vuông 1:1</option>
                        <option value="9:16">Dọc 9:16</option>
                        <option value="16:9">Ngang 16:9</option>
                    </select>
                </div>
                 <div>
                     <label htmlFor="image-count" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số lượng ảnh tạo ra</label>
                    <input
                        type="number"
                        id="image-count"
                        value={imageCount}
                        onChange={(e) => setImageCount(Math.max(1, parseInt(e.target.value, 10)))}
                        min="1"
                        max="4"
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
                {loading ? 'Đang tạo ảnh...' : 'Tạo ảnh'}
            </button>

            {loading && <Spinner />}
            {error && <ErrorMessage message={error} />}

            {resultImages.length > 0 && (
                 <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Kết quả</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {resultImages.map((image, index) => (
                             <div key={index} className="space-y-3">
                                 <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                    <img src={image} alt={`Kết quả ${index + 1}`} className="w-full h-auto object-contain" />
                                </div>
                                <button
                                    onClick={() => handleDownload(image, index)}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Tải xuống
                                </button>
                             </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerspectiveTab;