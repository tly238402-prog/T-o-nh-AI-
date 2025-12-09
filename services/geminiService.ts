import { GoogleGenAI, Part } from "@google/genai";
import { AspectRatio } from "../types";

export async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  const data = await base64EncodedDataPromise;
  return {
    inlineData: {
      data,
      mimeType: file.type,
    },
  };
}

export async function generateImage(model: string, parts: Part[], aspectRatio?: AspectRatio): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = {};
    if (aspectRatio) {
      config.imageConfig = { aspectRatio };
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config,
    });

    const resultImages: string[] = [];
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      // Thêm kiểm tra để đảm bảo content và parts tồn tại trước khi truy cập
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            resultImages.push(`data:${part.inlineData.mimeType};base64,${base64ImageBytes}`);
          }
        }
      }
    }

    if (resultImages.length === 0) {
      let errorMessage = "AI không trả về hình ảnh nào. Vui lòng thử lại với prompt khác.";
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        // Cung cấp thông báo lỗi cụ thể hơn nếu có thể
        if (candidate.finishReason === 'SAFETY') {
          errorMessage = "Yêu cầu của bạn đã bị chặn vì lý do an toàn. Vui lòng thử lại với một prompt hoặc hình ảnh khác.";
        } else if (candidate.finishReason && candidate.finishReason !== 'STOP') {
          errorMessage = `AI không thể hoàn thành yêu cầu. Lý do: ${candidate.finishReason}.`;
        }
      }
      throw new Error(errorMessage);
    }

    return resultImages;
  } catch (error) {
    console.error("Lỗi gọi API Gemini:", error);
    if (error instanceof Error) {
        // Ném lại lỗi với thông điệp gốc để hiển thị cho người dùng
        throw error;
    }
    throw new Error("Đã xảy ra lỗi không xác định khi gọi API.");
  }
}