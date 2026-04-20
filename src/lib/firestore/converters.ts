import {
  type FirestoreDataConverter,
  type DocumentData,
  type QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore'
import type { User, UserDoc, Project, ProjectDoc, ProjectPiece, PieceDoc } from '@/types'

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(user: User): DocumentData {
    const { uid: _uid, createdAt, scanResetDate, ...rest } = user
    return {
      ...rest,
      createdAt: Timestamp.fromDate(createdAt),
      scanResetDate: Timestamp.fromDate(scanResetDate),
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): User {
    const data = snapshot.data() as UserDoc
    return {
      uid: snapshot.id,
      displayName: data.displayName,
      email: data.email,
      photoURL: data.photoURL,
      scanCount: data.scanCount,
      createdAt: data.createdAt.toDate(),
      scanResetDate: data.scanResetDate.toDate(),
    }
  },
}

export const projectConverter: FirestoreDataConverter<Project> = {
  toFirestore(project: Project): DocumentData {
    const { id: _id, createdAt, updatedAt, ...rest } = project
    return {
      ...rest,
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: Timestamp.fromDate(updatedAt),
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Project {
    const data = snapshot.data() as ProjectDoc
    return {
      id: snapshot.id,
      name: data.name,
      setId: data.setId,
      setName: data.setName,
      setImageUrl: data.setImageUrl,
      status: data.status,
      totalPieces: data.totalPieces,
      foundPieces: data.foundPieces,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    }
  },
}

export const pieceConverter: FirestoreDataConverter<ProjectPiece> = {
  toFirestore(piece: ProjectPiece): DocumentData {
    const { id: _id, ...rest } = piece
    return rest
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): ProjectPiece {
    const data = snapshot.data() as PieceDoc
    return {
      id: snapshot.id,
      partNum: data.partNum,
      name: data.name,
      color: data.color,
      colorCode: data.colorCode,
      imageUrl: data.imageUrl,
      quantityRequired: data.quantityRequired,
      quantityFound: data.quantityFound,
      isComplete: data.isComplete,
    }
  },
}
