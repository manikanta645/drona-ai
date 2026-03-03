// Student Memory Management System
// Stores per-student data in localStorage under student name keys

const STUDENTS_KEY = 'dronaStudents';
const CURRENT_STUDENT_KEY = 'dronaCurrentStudent';

export const studentMemory = {
  // Get list of all registered students
  getAllStudents: () => {
    const students = localStorage.getItem(STUDENTS_KEY);
    return students ? JSON.parse(students) : [];
  },

  // Check if a student exists
  studentExists: (name) => {
    const students = studentMemory.getAllStudents();
    return students.includes(name);
  },

  // Create new student profile
  createStudent: (name) => {
    if (!name.trim()) return false;
    if (studentMemory.studentExists(name)) return false;

    const students = studentMemory.getAllStudents();
    students.push(name);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));

    // Initialize student data
    const studentData = {
      name: name,
      initiated: false,
      chatHistory: [],
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`dronaStudent_${name}`, JSON.stringify(studentData));
    return true;
  },

  // Get current student data
  getStudentData: (name) => {
    const data = localStorage.getItem(`dronaStudent_${name}`);
    if (!data) return null;
    return JSON.parse(data);
  },

  // Update student data
  updateStudentData: (name, updates) => {
    const data = studentMemory.getStudentData(name) || {};
    const updated = { ...data, ...updates, name: name };
    localStorage.setItem(`dronaStudent_${name}`, JSON.stringify(updated));
    return updated;
  },

  // Set current active student
  setCurrentStudent: (name) => {
    localStorage.setItem(CURRENT_STUDENT_KEY, name);
  },

  // Get currently active student
  getCurrentStudent: () => {
    return localStorage.getItem(CURRENT_STUDENT_KEY);
  },

  // Delete student profile
  deleteStudent: (name) => {
    const students = studentMemory.getAllStudents();
    const filtered = students.filter(s => s !== name);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(filtered));
    localStorage.removeItem(`dronaStudent_${name}`);
    
    // If this was the current student, clear it
    if (studentMemory.getCurrentStudent() === name) {
      localStorage.removeItem(CURRENT_STUDENT_KEY);
    }
  }
};

export default studentMemory;
