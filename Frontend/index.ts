/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'STUDENT' | 'COORDINATOR' | 'COE' | 'FACULTY' | 'BUTR' | 'HOD' | 'DEAN' | 'REGISTRAR' | 'DEPUTY_REGISTRAR' | 'VICE_CHANCELLOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface PhdApplication {
  id: string;
  studentId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ENROLLED';
  documents: { name: string; url: string }[];
  submittedAt: string;
  paymentStatus: 'PAID' | 'UNPAID';
}

export interface ExamResult {
  studentId: string;
  cetMarks: number; // out of 70
  fwcMarks: number; // out of 30
  totalMarks: number;
  meritRank?: number;
}

export interface RACProgress {
  id: string;
  studentId: string;
  date: string;
  reportUrl: string;
  attendance: number;
  remarks: string;
  status: 'SATISFIED' | 'UNSATISFIED';
}

export interface ThesisSubmission {
  id: string;
  studentId: string;
  thesisUrl: string;
  supervisorApproval: boolean;
  submittedAt: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED';
}
