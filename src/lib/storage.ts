import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/config/firebase'

export async function uploadIdentifyImage(userId: string, file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const storageRef = ref(storage, `identify/${userId}/${fileName}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function deleteIdentifyImage(url: string): Promise<void> {
  const storageRef = ref(storage, url)
  await deleteObject(storageRef)
}
