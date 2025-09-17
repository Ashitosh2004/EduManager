import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Institute, 
  Faculty, 
  Student, 
  Course, 
  Timetable, 
  User,
  FirestoreCollections 
} from '@/types';

class FirestoreService {
  // Generic CRUD operations
  private async getCollection<T extends keyof FirestoreCollections>(
    collectionName: T
  ) {
    return collection(db, collectionName);
  }

  private async getDocument<T extends keyof FirestoreCollections>(
    collectionName: T,
    id: string
  ): Promise<FirestoreCollections[T] | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as FirestoreCollections[T];
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${collectionName} document:`, error);
      throw error;
    }
  }

  // Institute operations
  async getInstitutes(): Promise<Institute[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'institutes'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Institute[];
    } catch (error) {
      console.error('Error getting institutes:', error);
      throw error;
    }
  }

  async getInstitute(id: string): Promise<Institute | null> {
    return this.getDocument('institutes', id);
  }

  async createInstitute(institute: Omit<Institute, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'institutes'), institute);
      return docRef.id;
    } catch (error) {
      console.error('Error creating institute:', error);
      throw error;
    }
  }

  // User operations
  async getUser(id: string): Promise<User | null> {
    return this.getDocument('users', id);
  }

  async createUser(user: Omit<User, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'users'), user);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createUserWithId(id: string, user: Omit<User, 'id'>): Promise<void> {
    try {
      const docRef = doc(db, 'users', id);
      await setDoc(docRef, user, { merge: true });
    } catch (error) {
      console.error('Error creating user with ID:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Faculty operations
  async getFacultyByInstitute(instituteId: string): Promise<Faculty[]> {
    try {
      const q = query(
        collection(db, 'faculty'),
        where('instituteId', '==', instituteId),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Faculty[];
    } catch (error) {
      console.error('Error getting faculty:', error);
      throw error;
    }
  }

  async getFacultyByDepartment(instituteId: string, department: string): Promise<Faculty[]> {
    try {
      const q = query(
        collection(db, 'faculty'),
        where('instituteId', '==', instituteId),
        where('department', '==', department),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Faculty[];
    } catch (error) {
      console.error('Error getting faculty by department:', error);
      throw error;
    }
  }

  async createFaculty(faculty: Omit<Faculty, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'faculty'), {
        ...faculty,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating faculty:', error);
      throw error;
    }
  }

  async updateFaculty(id: string, updates: Partial<Faculty>): Promise<void> {
    try {
      const docRef = doc(db, 'faculty', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating faculty:', error);
      throw error;
    }
  }

  async deleteFaculty(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'faculty', id));
    } catch (error) {
      console.error('Error deleting faculty:', error);
      throw error;
    }
  }

  // Student operations
  async getStudentsByClass(instituteId: string, department: string, className: string): Promise<Student[]> {
    try {
      const q = query(
        collection(db, 'students'),
        where('instituteId', '==', instituteId),
        where('department', '==', department),
        where('class', '==', className),
        orderBy('rollNumber')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
    } catch (error) {
      console.error('Error getting students by class:', error);
      throw error;
    }
  }

  async createStudent(student: Omit<Student, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'students'), {
        ...student,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<void> {
    try {
      const docRef = doc(db, 'students', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // Course operations
  async getCoursesByDepartment(instituteId: string, department: string): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses'),
        where('instituteId', '==', instituteId),
        where('department', '==', department),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
    } catch (error) {
      console.error('Error getting courses by department:', error);
      throw error;
    }
  }

  async createCourse(course: Omit<Course, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'courses'), {
        ...course,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<void> {
    try {
      const docRef = doc(db, 'courses', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'courses', id));
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Timetable operations
  async getTimetablesByInstitute(instituteId: string): Promise<Timetable[]> {
    try {
      const q = query(
        collection(db, 'timetables'),
        where('instituteId', '==', instituteId),
        orderBy('generatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Timetable[];
    } catch (error) {
      console.error('Error getting timetables:', error);
      throw error;
    }
  }

  async getTimetableByClass(instituteId: string, className: string, semester: string): Promise<Timetable | null> {
    try {
      const q = query(
        collection(db, 'timetables'),
        where('instituteId', '==', instituteId),
        where('class', '==', className),
        where('semester', '==', semester),
        orderBy('generatedAt', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Timetable;
      }
      return null;
    } catch (error) {
      console.error('Error getting timetable by class:', error);
      throw error;
    }
  }

  async saveTimetable(timetable: Omit<Timetable, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'timetables'), {
        ...timetable,
        generatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving timetable:', error);
      throw error;
    }
  }

  async updateTimetable(id: string, updates: Partial<Timetable>): Promise<void> {
    try {
      const docRef = doc(db, 'timetables', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating timetable:', error);
      throw error;
    }
  }

  // Statistics
  async getStatistics(instituteId: string) {
    try {
      const [studentsSnapshot, facultySnapshot, coursesSnapshot, timetablesSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'students'), where('instituteId', '==', instituteId))),
        getDocs(query(collection(db, 'faculty'), where('instituteId', '==', instituteId))),
        getDocs(query(collection(db, 'courses'), where('instituteId', '==', instituteId))),
        getDocs(query(collection(db, 'timetables'), where('instituteId', '==', instituteId)))
      ]);

      return {
        students: studentsSnapshot.size,
        faculty: facultySnapshot.size,
        courses: coursesSnapshot.size,
        timetables: timetablesSnapshot.size
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();
