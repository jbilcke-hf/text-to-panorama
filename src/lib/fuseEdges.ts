export async function fuseEdges({
  base64DataUriInput,
  inputWidth,
  inputHeight,
  outputWidth
}: {
  base64DataUriInput: string;
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const img1 = new Image();
    const img2 = new Image();
    
    img1.onload = () => {
      img2.src = base64DataUriInput; // Load the same image for the second edge
      img2.onload = () => {
        const transitionWidth = inputWidth - outputWidth;
        const canvas = document.createElement('canvas');
        canvas.width = outputWidth;
        canvas.height = inputHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          reject(new Error('Unable to get 2D context'));
          return;
        }

        // Draw the right part of the first image onto the canvas
        ctx.drawImage(img1, transitionWidth, 0, outputWidth, inputHeight, 0, 0, outputWidth, inputHeight);

        // Get the image data for the output
        const outputImageData = ctx.getImageData(0, 0, outputWidth, inputHeight);
        const outputData = outputImageData.data;
        
        // Draw the left part of the second image
        ctx.drawImage(img2, 0, 0, transitionWidth, inputHeight, outputWidth - transitionWidth, 0, transitionWidth, inputHeight);

        // Get the left edge image data from the second image
        const leftEdgeImageData = ctx.getImageData(outputWidth - transitionWidth, 0, transitionWidth, inputHeight);
        const leftEdgeData = leftEdgeImageData.data;

        // Helper function for smoothstep
        const smoothstep = (edge0: number, edge1: number, x: number): number => {
          const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
          return t * t * (3 - 2 * t);
        };

        // Blend the edges
        for (let y = 0; y < inputHeight; y++) {
          for (let x = 0; x < transitionWidth; x++) {
            const outputIndex = (y * outputWidth + (outputWidth - transitionWidth + x)) * 4;
            const leftEdgeIndex = (y * transitionWidth + x) * 4;

            const blendFactor = smoothstep(0, transitionWidth - 1, x);

            for (let i = 0; i < 4; i++) {
              const outputPixel = outputData[outputIndex + i];
              const leftEdgePixel = leftEdgeData[leftEdgeIndex + i];
              
              outputData[outputIndex + i] = Math.round(outputPixel * (1 - blendFactor) + leftEdgePixel * blendFactor);
            }
          }
        }

        // Put the modified image data back to the canvas
        ctx.putImageData(outputImageData, 0, 0);

        // Convert canvas to base64 data URI
        const resultDataUri = canvas.toDataURL('image/jpeg');
        resolve(resultDataUri);
      };

      img2.onerror = () => {
        reject(new Error('Failed to load second image'));
      };
    };

    img1.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img1.src = base64DataUriInput; // Start loading the first image
  });
}