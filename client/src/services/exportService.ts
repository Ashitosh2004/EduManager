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
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Professional header with enhanced design
    doc.setFillColor(41, 128, 185); // Professional blue
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Institution title
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TIMETABLE', pageWidth / 2, 20, { align: 'center' });
    
    // Class/Department info
    doc.setFontSize(16);
    const titleText = timetable.class?.toUpperCase() || timetable.department.toUpperCase();
    doc.text(titleText, pageWidth / 2, 35, { align: 'center' });
    
    // Academic information with better layout
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const academicInfo = [
      `Academic Year: ${timetable.academicYear}`,
      `Semester: ${timetable.semester}`,
      `Generated: ${new Date(timetable.generatedAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`
    ];
    
    let yPos = 65;
    academicInfo.forEach((info, index) => {
      const xPos = 20 + (index * 90);
      doc.text(info, xPos, yPos);
    });

    // Fixed university timetable time slots matching TimetableGrid
    const timeSlots = [
      { time: "09:00", label: "9:00", isBreak: false },
      { time: "10:00", label: "10:00", isBreak: false },
      { time: "break1", label: "Short Break", isBreak: true },
      { time: "11:15", label: "11:15", isBreak: false },
      { time: "12:15", label: "12:15", isBreak: false },
      { time: "break2", label: "Lunch Break", isBreak: true },
      { time: "14:00", label: "14:00", isBreak: false },
      { time: "15:00", label: "15:00", isBreak: false }
    ];
    
    // Abbreviated days matching TimetableGrid
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    // Create table data
    const tableData = [];
    
    // Header row
    const header = ['Time', ...days];
    tableData.push(header);
    
    // Data rows with TimetableGrid formatting
    timeSlots.forEach(slot => {
      if (slot.isBreak) {
        // Break row - will be styled to visually span across all days
        const breakRow = [slot.label, '', '', '', '', ''];
        tableData.push(breakRow);
      } else {
        const row = [slot.label];
        days.forEach(day => {
          // Find all entries for this day and time slot
          const dayEntries = timetable.entries.filter(e => {
            const entryDay = e.day?.substring(0, 3); // Convert "Monday" to "Mon"
            const entryTime = this.normalizeTime(e.startTime);
            return entryDay === day && entryTime === slot.time;
          });

          if (dayEntries.length === 0) {
            row.push('-');
          } else {
            // Format multiple entries with TimetableGrid format
            const cellContent = dayEntries.map(entry => 
              this.formatCellContentForPDF(entry)
            ).join('\n');
            row.push(cellContent);
          }
        });
        tableData.push(row);
      }
    });

    // Add table with enhanced professional styling
    doc.autoTable({
      head: [header],
      body: tableData.slice(1),
      startY: 80,
      styles: {
        fontSize: 10,
        cellPadding: 6,
        lineWidth: 0.8,
        lineColor: [52, 73, 94],
        fontStyle: 'normal'
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 11
      },
      columnStyles: {
        0: { 
          halign: 'center', 
          fillColor: [236, 240, 241],
          fontStyle: 'bold',
          textColor: [52, 73, 94]
        }, // Time column
        1: { halign: 'center', minCellWidth: 35 },
        2: { halign: 'center', minCellWidth: 35 },
        3: { halign: 'center', minCellWidth: 35 },
        4: { halign: 'center', minCellWidth: 35 },
        5: { halign: 'center', minCellWidth: 35 }
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      didParseCell: function(data: any) {
        // Style break rows with enhanced colors
        if (data.cell.raw.includes('Break')) {
          data.cell.styles.fillColor = [230, 126, 34];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
          data.cell.styles.fontSize = 11;
        }
        
        // Add subtle borders for better definition
        data.cell.styles.cellPadding = { top: 6, right: 4, bottom: 6, left: 4 };
        
        // Enhance text readability for non-empty cells
        if (data.cell.raw !== '-' && !data.cell.raw.includes('Break')) {
          data.cell.styles.textColor = [33, 37, 41];
          data.cell.styles.fontSize = 9;
        }
      }
    });

    // Add conflicts section with enhanced styling
    if (timetable.conflicts.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY + 25;
      
      // Conflicts header with warning styling
      doc.setFillColor(231, 76, 60);
      doc.rect(20, finalY - 5, pageWidth - 40, 20, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('WARNING: CONFLICTS DETECTED', 25, finalY + 7);
      
      const conflictData = timetable.conflicts.map((conflict, index) => [
        index + 1,
        conflict.type.toUpperCase(),
        conflict.severity.toUpperCase(),
        conflict.description
      ]);

      doc.autoTable({
        head: [['#', 'Type', 'Severity', 'Description']],
        body: conflictData,
        startY: finalY + 20,
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineWidth: 0.5,
          lineColor: [189, 195, 199]
        },
        headStyles: {
          fillColor: [231, 76, 60],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'center', cellWidth: 25 },
          3: { halign: 'left' }
        },
        didParseCell: function(data: any) {
          // Color code severity levels
          if (data.column.index === 2) { // Severity column
            const severity = data.cell.raw ? data.cell.raw.toString().toLowerCase() : 'low';
            if (severity === 'high') {
              data.cell.styles.fillColor = [231, 76, 60];
              data.cell.styles.textColor = [255, 255, 255];
            } else if (severity === 'medium') {
              data.cell.styles.fillColor = [243, 156, 18];
              data.cell.styles.textColor = [255, 255, 255];
            } else {
              data.cell.styles.fillColor = [52, 152, 219];
              data.cell.styles.textColor = [255, 255, 255];
            }
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });
    }

    // Add professional footer with dynamic pagination
    const totalPages = doc.getNumberOfPages();
    
    // Add footer to all pages
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const footerY = pageHeight - 20;
      
      doc.setDrawColor(52, 73, 94);
      doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
      
      doc.setFontSize(8);
      doc.setTextColor(127, 140, 141);
      doc.setFont('helvetica', 'normal');
      
      const footerLeft = `Generated by Timetable Management System`;
      const footerCenter = `Page ${i} of ${totalPages}`;
      const footerRight = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      
      doc.text(footerLeft, 20, footerY);
      doc.text(footerCenter, pageWidth / 2, footerY, { align: 'center' });
      doc.text(footerRight, pageWidth - 20, footerY, { align: 'right' });
    }

    // Save the PDF with better filename
    const filename = `Timetable_${timetable.class || timetable.department}_${timetable.semester}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }

  /**
   * Export timetable to Excel
   */
  async exportTimetableToExcel(timetable: Timetable): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    // Fixed university timetable time slots matching TimetableGrid
    const timeSlots = [
      { time: "09:00", label: "9:00", isBreak: false },
      { time: "10:00", label: "10:00", isBreak: false },
      { time: "break1", label: "Short Break", isBreak: true },
      { time: "11:15", label: "11:15", isBreak: false },
      { time: "12:15", label: "12:15", isBreak: false },
      { time: "break2", label: "Lunch Break", isBreak: true },
      { time: "14:00", label: "14:00", isBreak: false },
      { time: "15:00", label: "15:00", isBreak: false }
    ];
    
    // Abbreviated days matching TimetableGrid
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    // Prepare worksheet data
    const worksheetData = [];
    
    // Header row
    worksheetData.push(['Time', ...days]);
    
    // Data rows with TimetableGrid formatting
    timeSlots.forEach((slot) => {
      if (slot.isBreak) {
        // Break row - span across all days
        const breakRow = [slot.label, slot.label, slot.label, slot.label, slot.label, slot.label];
        worksheetData.push(breakRow);
      } else {
        const row = [slot.label];
        days.forEach(day => {
          // Find all entries for this day and time slot
          const dayEntries = timetable.entries.filter(e => {
            const entryDay = e.day?.substring(0, 3); // Convert "Monday" to "Mon"
            const entryTime = this.normalizeTime(e.startTime);
            return entryDay === day && entryTime === slot.time;
          });

          if (dayEntries.length === 0) {
            row.push('-');
          } else {
            // Format multiple entries with TimetableGrid format
            const cellContent = dayEntries.map(entry => 
              this.formatCellContentForPDF(entry)
            ).join('\n');
            row.push(cellContent);
          }
        });
        worksheetData.push(row);
      }
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
   * Normalize time format for consistent matching
   */
  private normalizeTime(timeStr: string): string {
    if (!timeStr) return '';
    
    const time = timeStr.trim();
    
    // If already in HH:MM format, return as-is
    if (/^\d{2}:\d{2}$/.test(time)) {
      return time;
    }
    
    // Handle single digit hours like "9:00" -> "09:00"
    if (/^\d:\d{2}$/.test(time)) {
      return `0${time}`;
    }
    
    // Handle AM/PM formats
    const ampmMatch = time.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/i);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1]);
      const minutes = ampmMatch[2] || '00';
      const period = ampmMatch[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    
    // Handle single digit hours without minutes like "9" -> "09:00"
    if (/^\d{1,2}$/.test(time)) {
      const hours = parseInt(time);
      if (hours >= 0 && hours <= 23) {
        return `${hours.toString().padStart(2, '0')}:00`;
      }
    }
    
    // Return original if no pattern matches
    return time;
  }

  /**
   * Format cell content to match TimetableGrid format
   */
  private formatCellContentForPDF(entry: TimetableEntry): string {
    // Get subject code from subject name 
    const getSubjectCode = (subjectName: string): string => {
      return subjectName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3) || subjectName.substring(0, 3).toUpperCase();
    };

    // Get faculty initials
    const getFacultyInitials = (facultyName: string): string => {
      return facultyName
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3) || facultyName.substring(0, 3).toUpperCase();
    };

    // Format room number
    const formatRoom = (room: string): string => {
      if (!room) return '';
      if (room.toLowerCase().includes('cr')) return room.toUpperCase();
      return `CR ${room}`;
    };

    const subjectCode = getSubjectCode(entry.subjectName);
    const facultyInitials = getFacultyInitials(entry.facultyName);
    const room = formatRoom(entry.room);
    
    return `${subjectCode}-${facultyInitials}${room ? ' ' + room : ''}`;
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
