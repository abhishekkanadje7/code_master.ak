
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { User, Exam, Submission, Batch } from '../types';
import { PLATFORM_NAME } from '../constants';

export const PdfGenerator = {
  generateStudentReport: (student: User, exam: Exam, submission: Submission, batch: Batch) => {
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Branding
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(PLATFORM_NAME, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Examination Performance Report', pageWidth / 2, 30, { align: 'center' });

    // Student Info
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Student Details', 14, 45);
    doc.autoTable({
      startY: 50,
      head: [['Field', 'Information']],
      body: [
        ['Name', student.name],
        ['Email', student.email],
        ['Student ID', student.id],
        ['Batch', batch.name]
      ],
      theme: 'striped'
    });

    // Exam Info
    const startY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Exam Details', 14, startY);
    doc.autoTable({
      startY: startY + 5,
      head: [['Exam Name', 'Marks Obtained', 'Percentage', 'Status']],
      body: [
        [
          exam.name,
          `${submission.score} / ${exam.totalMarks}`,
          `${((submission.score / exam.totalMarks) * 100).toFixed(2)}%`,
          submission.score >= (exam.totalMarks * 0.4) ? 'PASS' : 'FAIL'
        ]
      ],
      theme: 'grid'
    });

    // Integrity Check
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Security & Submission Info', 14, finalY);
    doc.autoTable({
      startY: finalY + 5,
      body: [
        ['Warnings Used', `${submission.warningsCount} / 3`],
        ['Submission Type', submission.isAutoSubmitted ? 'AUTO-SUBMITTED (Violation)' : 'MANUAL SUBMIT'],
        ['Time Taken', `${Math.round((submission.endTime - submission.startTime) / 60000)} mins`],
        ['Submitted At', new Date(submission.endTime).toLocaleString()]
      ],
      theme: 'plain'
    });

    doc.setFontSize(10);
    doc.text(`© ${PLATFORM_NAME} – Secure Exam Platform`, pageWidth / 2, 280, { align: 'center' });

    doc.save(`${student.name}_${exam.name}_Report.pdf`);
  }
};
