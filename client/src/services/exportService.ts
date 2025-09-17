import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TimetableEntry, Timetable } from '@/types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

class ExportService {
  /**
   * Export timetable to PDF
   */
  async exportTimetableToPDF(timetable: Timetable): Promise<void> {
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(20);
    doc.text(`Timetable - ${timetable.class}`, 20, 20);
    
    // Add metadata
    doc.setFontSize(12);
    doc.text(`Department: ${timetable.department}`, 20, 35);
    doc.text(`Semester: ${timetable.semester}`, 20, 45);
    doc.text(`Academic Year: ${timetable.academicYear}`, 20, 55);
    doc.text(`Generated: ${new Date(timetable.generatedAt).toLocaleDateString()}`, 20, 65);

    // Prepare timetable data
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = this.getUniqueTimeSlots(timetable.entries);
    
    // Create table data
    const tableData = [];
    
    // Header row
    const header = ['Time', ...days];
    tableData.push(header);
    
    // Data rows
    timeSlots.forEach(timeSlot => {
      const row = [timeSlot];
      days.forEach(day => {
        const entry = timetable.entries.find(e => 
          e.day === day && e.startTime === timeSlot
        );
        const cellData = entry 
          ? `${entry.subjectName}\n${entry.facultyName}\n${entry.room}`
          : '-';
        row.push(cellData);
      });
      tableData.push(row);
    });

    // Add table
    doc.autoTable({
      head: [header],
      body: tableData.slice(1),
      startY: 75,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    // Add conflicts if any
    if (timetable.conflicts.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.text('Conflicts:', 20, finalY);
      
      const conflictData = timetable.conflicts.map((conflict, index) => [
        index + 1,
        conflict.type,
        conflict.severity,
        conflict.description
      ]);

      doc.autoTable({
        head: [['#', 'Type', 'Severity', 'Description']],
        body: conflictData,
        startY: finalY + 10,
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [244, 67, 54],
          textColor: 255
        }
      });
    }

    // Save the PDF
    doc.save(`timetable_${timetable.class}_${timetable.semester}.pdf`);
  }

  /**
   * Export timetable to Excel
   */
  async exportTimetableToExcel(timetable: Timetable): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    // Main timetable sheet
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = this.getUniqueTimeSlots(timetable.entries);
    
    // Prepare worksheet data
    const worksheetData = [];
    
    // Header row
    worksheetData.push(['Time', ...days]);
    
    // Data rows
    timeSlots.forEach(timeSlot => {
      const row = [timeSlot];
      days.forEach(day => {
        const entry = timetable.entries.find(e => 
          e.day === day && e.startTime === timeSlot
        );
        const cellData = entry 
          ? `${entry.subjectName}\n${entry.facultyName}\n${entry.room}`
          : '-';
        row.push(cellData);
      });
      worksheetData.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Time column
      { wch: 20 }, // Monday
      { wch: 20 }, // Tuesday
      { wch: 20 }, // Wednesday
      { wch: 20 }, // Thursday
      { wch: 20 }  // Friday
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable');

    // Add conflicts sheet if any
    if (timetable.conflicts.length > 0) {
      const conflictData = [
        ['Type', 'Severity', 'Description', 'Status'],
        ...timetable.conflicts.map(conflict => [
          conflict.type,
          conflict.severity,
          conflict.description,
          conflict.resolved ? 'Resolved' : 'Unresolved'
        ])
      ];
      
      const conflictWorksheet = XLSX.utils.aoa_to_sheet(conflictData);
      conflictWorksheet['!cols'] = [
        { wch: 15 },
        { wch: 15 },
        { wch: 50 },
        { wch: 15 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, conflictWorksheet, 'Conflicts');
    }

    // Add faculty workload sheet
    const facultyWorkload = this.calculateFacultyWorkload(timetable.entries);
    if (facultyWorkload.length > 0) {
      const workloadData = [
        ['Faculty', 'Total Hours', 'Subjects', 'Classes'],
        ...facultyWorkload
      ];
      
      const workloadWorksheet = XLSX.utils.aoa_to_sheet(workloadData);
      workloadWorksheet['!cols'] = [
        { wch: 20 },
        { wch: 15 },
        { wch: 30 },
        { wch: 20 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, workloadWorksheet, 'Faculty Workload');
    }

    // Add metadata sheet
    const metadataData = [
      ['Property', 'Value'],
      ['Class', timetable.class],
      ['Department', timetable.department],
      ['Semester', timetable.semester],
      ['Academic Year', timetable.academicYear],
      ['Generated On', new Date(timetable.generatedAt).toLocaleString()],
      ['Total Entries', timetable.entries.length],
      ['Conflicts', timetable.conflicts.length]
    ];
    
    const metadataWorksheet = XLSX.utils.aoa_to_sheet(metadataData);
    metadataWorksheet['!cols'] = [{ wch: 20 }, { wch: 30 }];
    
    XLSX.utils.book_append_sheet(workbook, metadataWorksheet, 'Info');

    // Save the file
    XLSX.writeFile(workbook, `timetable_${timetable.class}_${timetable.semester}.xlsx`);
  }

  /**
   * Export faculty list to PDF
   */
  async exportFacultyListToPDF(faculty: any[], instituteName: string): Promise<void> {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`Faculty List - ${instituteName}`, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);

    const tableData = faculty.map((f, index) => [
      index + 1,
      f.name,
      f.email,
      f.department,
      f.classes.join(', '),
      f.subjects.join(', ')
    ]);

    doc.autoTable({
      head: [['#', 'Name', 'Email', 'Department', 'Classes', 'Subjects']],
      body: tableData,
      startY: 45,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255
      }
    });

    doc.save(`faculty_list_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Export student list to Excel
   */
  async exportStudentListToExcel(students: any[], className: string): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    const worksheetData = [
      ['Roll Number', 'Name', 'Email', 'Department', 'Class', 'Year', 'Semester', 'Phone', 'Parent Contact'],
      ...students.map(student => [
        student.rollNumber,
        student.name,
        student.email,
        student.department,
        student.class,
        student.year,
        student.semester,
        student.phoneNumber || '',
        student.parentContact || ''
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!cols'] = [
      { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 15 },
      { wch: 15 }, { wch: 8 }, { wch: 10 }, { wch: 15 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    XLSX.writeFile(workbook, `students_${className}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Get unique time slots from timetable entries
   */
  private getUniqueTimeSlots(entries: TimetableEntry[]): string[] {
    const timeSlots = Array.from(new Set(entries.map(e => e.startTime)));
    return timeSlots.sort((a, b) => {
      const timeA = new Date(`1970-01-01T${a}:00`);
      const timeB = new Date(`1970-01-01T${b}:00`);
      return timeA.getTime() - timeB.getTime();
    });
  }

  /**
   * Calculate faculty workload from timetable entries
   */
  private calculateFacultyWorkload(entries: TimetableEntry[]): any[] {
    const facultyMap = new Map();
    
    entries.forEach(entry => {
      if (!facultyMap.has(entry.facultyId)) {
        facultyMap.set(entry.facultyId, {
          name: entry.facultyName,
          hours: 0,
          subjects: new Set(),
          classes: new Set()
        });
      }
      
      const faculty = facultyMap.get(entry.facultyId);
      faculty.hours++;
      faculty.subjects.add(entry.subjectName);
      faculty.classes.add(entry.class);
    });

    return Array.from(facultyMap.values()).map(faculty => [
      faculty.name,
      faculty.hours,
      Array.from(faculty.subjects).join(', '),
      Array.from(faculty.classes).join(', ')
    ]);
  }
}

export const exportService = new ExportService();
