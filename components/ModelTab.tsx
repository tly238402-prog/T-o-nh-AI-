import React, { useState, useCallback } from 'react';
import { Part } from "@google/genai";
import ImageInput from './ImageInput';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import { AspectRatio } from '../types';
import { fileToGenerativePart, generateImage } from '../services/geminiService';

interface ModelTabProps {
}

const ModelTab: React.FC<ModelTabProps> = () => {
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [outfitFile, setOutfitFile] = useState<File | null>(null);
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = useCallback(async () => {
        if (!modelFile || !outfitFile) {
            setError("Vui lòng tải lên cả 'Ảnh người mẫu' và 'Ảnh trang phục'.");
            return;
        }

        setLoading(true);
        setError('');
        setResultImage(null);

        try {
            const modelPart = await fileToGenerativePart(modelFile);
            const outfitPart = await fileToGenerativePart(outfitFile);
            let promptText = '';
            const parts: Part[] = [];

            if (backgroundFile) {
                const backgroundPart = await fileToGenerativePart(backgroundFile);
                promptText = `**Nhiệm-vụ Tối-thượng: Ghép Mẫu Vào Bối Cảnh Chuyên Nghiệp**

**CẢNH BÁO: MỌI SAI LỆCH SO VỚI YÊU CẦU SẼ KHIẾN HÌNH ẢNH BỊ LOẠI BỎ.**

Bạn sẽ nhận được 3 hình ảnh và 1 mô tả:
1.  **Ảnh Người Mẫu:** Chứa người mẫu gốc.
2.  **Ảnh Trang Phục:** Chứa bộ trang phục đã được bóc tách.
3.  **Ảnh Bối Cảnh:** Chứa cảnh nền.
4.  **Mô tả:** Hướng dẫn về tư thế và vị trí của người mẫu trong bối cảnh.

**Nhiệm vụ của bạn là "mặc" trang phục từ "Ảnh Trang Phục" lên người mẫu, sau đó ghép họ một cách siêu thực vào "Ảnh Bối Cảnh", và tuân thủ các quy tắc VÀNG sau:**

**QUY TẮC VÀNG #1: BẢO TOÀN DANH TÍNH NGƯỜI MẪU 100%**
*   **KHÔNG THAY ĐỔI KHUÔN MẶT:** Giữ lại y hệt bản gốc.
*   **KHÔNG THAY ĐỔI TÓC:** Giữ nguyên.
*   **GIỮ NGUYÊN DÁNG NGƯỜI:** Tỷ lệ cơ thể phải được giữ nguyên.

**QUY TẮC VÀNG #2: BẢO TOÀN TRANG PHỤC 100%**
*   **KHÔNG THAY ĐỔI VẢI & CHI TIẾT:** Kết cấu, màu sắc, logo phải y hệt "Ảnh Trang Phục".
*   **FORM DÁNG TỰ NHIÊN:** Trang phục phải vừa vặn với cơ thể người mẫu.

**QUY TRÌNH THỰC HIỆN:**
1.  **"Mặc" Trang Phục:** Áp dụng trang phục lên người mẫu.
2.  **Ghép Nền:** Đặt người mẫu (đã mặc trang phục mới) vào "Ảnh Bối Cảnh".
3.  **Tạo Dáng & Vị Trí:** Dựa vào mô tả: "${description || 'người mẫu đứng tự nhiên trong bối cảnh'}", điều chỉnh tư thế và vị trí của người mẫu.
4.  **Hòa Hợp Ánh Sáng & Bóng Đổ:** Đây là bước QUAN TRỌNG NHẤT. Ánh sáng và bóng đổ từ "Ảnh Bối Cảnh" phải được áp dụng một cách chính xác lên người mẫu và trang phục. Phải tạo ra bóng đổ của người mẫu lên nền một cách chân thực.
5.  **Hoàn Thiện:** Kết quả cuối cùng phải là một bức ảnh 4K, sắc nét, trông như một bức ảnh duy nhất, không có dấu hiệu cắt ghép.`;
                
                parts.push({ text: promptText }, modelPart, outfitPart, backgroundPart);
            } else {
                 promptText = `**Nhiệm-vụ Tối-thượng: Tạo Ảnh Mẫu Thời Trang Chuyên Nghiệp**

**CẢNH BÁO: MỌI SAI LỆCH SO VỚI YÊU CẦU SẼ KHIẾN HÌNH ẢNH BỊ LOẠI BỎ.**

Bạn sẽ nhận được 2 hình ảnh và 1 mô tả:
1.  **Ảnh Người Mẫu:** Chứa một người mẫu.
2.  **Ảnh Trang Phục:** Chứa một bộ trang phục đã được bóc tách nền.
3.  **Mô tả:** Chi tiết về bối cảnh, ánh sáng, và tư thế.

**Nhiệm vụ của bạn là "mặc" trang phục từ "Ảnh Trang Phục" lên người mẫu trong "Ảnh Người Mẫu" một cách siêu thực, đặt họ vào bối cảnh được mô tả, và tuân thủ các quy tắc VÀNG sau:**

**QUY TẮC VÀNG #1: BẢO TOÀN DANH TÍNH NGƯỜI MẪU 100%**
*   **KHÔNG THAY ĐỔI KHUÔN MẶT:** Mọi đường nét, biểu cảm, màu da, và chi tiết trên khuôn mặt phải được giữ lại y hệt bản gốc.
*   **KHÔNG THAY ĐỔI TÓC:** Kiểu tóc, màu tóc, và từng sợi tóc phải được giữ nguyên.
*   **GIỮ NGUYÊN DÁNG NGƯỜI:** Tỷ lệ cơ thể, chiều cao của người mẫu phải được giữ nguyên.

**QUY TẮC VÀNG #2: BẢO TOÀN TRANG PHỤC 100%**
*   **KHÔNG THAY ĐỔI VẢI:** Kết cấu, chất liệu, độ bóng phải được sao chép chính xác từ "Ảnh Trang Phục".
*   **KHÔNG THAY ĐỔI CHI TIẾT:** Màu sắc, logo, họa tiết, đường may phải y hệt "Ảnh Trang Phục".
*   **FORM DÁNG TỰ NHIÊN:** Trang phục phải vừa vặn với cơ thể người mẫu một cách tự nhiên, tạo ra các nếp gấp hợp lý theo tư thế.

**QUY TRÌNH THỰC HIỆN:**

1.  **"Mặc" Trang Phục:** Áp dụng trang phục lên người mẫu, thay thế quần áo họ đang mặc (nếu có).
2.  **Dựng Bối Cảnh:** Tạo ra bối cảnh theo mô tả: "${description || 'studio thời trang chuyên nghiệp với ánh sáng dịu nhẹ'}".
3.  **Tạo Dáng & Thần Thái:** Điều chỉnh tư thế của người mẫu cho phù hợp với mô tả và trang phục, giữ nguyên khuôn mặt và dáng người.
4.  **Hòa Hợp Ánh Sáng:** Ánh sáng trong bối cảnh phải ảnh hưởng một cách nhất quán và chân thực lên cả người mẫu và trang phục, tạo ra bóng đổ tự nhiên.
5.  **Hoàn Thiện:** Kết quả cuối cùng phải là một bức ảnh 4K, sắc nét, trông như một buổi chụp hình thời trang chuyên nghiệp.`;
                parts.push({ text: promptText }, modelPart, outfitPart);
            }

            const images = await generateImage('gemini-2.5-flash-image', parts, aspectRatio);

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

    }, [modelFile, outfitFile, backgroundFile, description, aspectRatio]);
    
    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = 'ket-qua-nguoi-mau.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageInput id="model-image" label="Tải ảnh người mẫu" onFileChange={setModelFile} />
                <ImageInput id="outfit-image" label="Tải ảnh trang phục (đã bóc tách)" onFileChange={setOutfitFile} />
            </div>

            <ImageInput id="background-image" label="Tải ảnh bối cảnh (tùy chọn)" onFileChange={setBackgroundFile} />

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả bối cảnh, tư thế, ánh sáng...</label>
                <textarea
                    id="description"
                    rows={3}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Người mẫu đang đứng trong một quán cà phê ở Paris, ánh nắng chiều chiếu xiên qua cửa sổ..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            
            <div>
                 <label htmlFor="aspect-ratio-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chọn tỉ lệ ảnh</label>
                 <select
                    id="aspect-ratio-model"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600"
                >
                    <option value="1:1">Vuông 1:1</option>
                    <option value="9:16">Dọc 9:16</option>
                    <option value="16:9">Ngang 16:9</option>
                </select>
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
                {loading ? 'Đang tạo ảnh...' : 'Tạo ảnh người mẫu'}
            </button>

            {loading && <Spinner />}
            {error && <ErrorMessage message={error} />}

            {resultImage && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Kết quả</h3>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <img src={resultImage} alt="Kết quả tạo người mẫu" className="w-full h-auto object-contain" />
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

export default ModelTab;