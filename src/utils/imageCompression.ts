const MAX_DIMENSION = 1024
const MAX_SIZE_KB = 500

export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width)
          width = MAX_DIMENSION
        } else {
          width = Math.round((width * MAX_DIMENSION) / height)
          height = MAX_DIMENSION
        }
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      let quality = 0.9
      const compress = (): void => {
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        const sizeKB = (dataUrl.length * 0.75) / 1024

        if (sizeKB <= MAX_SIZE_KB || quality <= 0.1) {
          resolve(dataUrl.split(',')[1])
        } else {
          quality = Math.round((quality - 0.1) * 10) / 10
          compress()
        }
      }

      compress()
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }

    img.src = objectUrl
  })
}
