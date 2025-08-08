import type { LucideIcon } from 'lucide-react';
import { FileCheck, Users, Mail, CheckCircle2, List, Send, User, FileText as FileTextIcon } from 'lucide-react';

export interface WorkflowStep {
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  icon: LucideIcon;
}

export interface TopMatch {
  name: string;
  similarity: string;
  profileUrl: string;
  avatarUrl: string;
}

export interface ARDashboardData {
  jdComparisonStatus: 'Completed' | 'In Progress';
  topMatchesStatus: 'Listed' | 'Not Found';
  emailNotificationStatus: 'Sent' | 'Pending';
  workflowSteps: WorkflowStep[];
  topMatches: TopMatch[];
}

export const arDashboardData: ARDashboardData = {
  jdComparisonStatus: 'Completed',
  topMatchesStatus: 'Listed',
  emailNotificationStatus: 'Sent',
  workflowSteps: [
    { name: 'JD Compared', status: 'completed', icon: FileCheck },
    { name: 'Profiles Ranked', status: 'completed', icon: List },
    { name: 'Email Sent', status: 'completed', icon: Send },
  ],
  topMatches: [
    { name: 'Elena Rodriguez', similarity: '92%', profileUrl: '#', avatarUrl: 'https://placehold.co/100x100.png' },
    { name: 'Marcus Chen', similarity: '88%', profileUrl: '#', avatarUrl: 'https://placehold.co/100x100.png' },
    { name: 'Aisha Khan', similarity: '85%', profileUrl: '#', avatarUrl: 'https://placehold.co/100x100.png' },
  ],
};

export interface JobDescription {
  id: string;
  title: string;
  skills: string[];
  experience: string;
  status: 'Open' | 'Closed' | 'Interviewing';
  name?: string; // name is title
}

export const recruiterJds: JobDescription[] = [
  { id: 'JD001', title: 'Senior Frontend Developer', skills: ['React', 'TypeScript', 'Next.js'], experience: '5+ Years', status: 'Open' },
  { id: 'JD002', title: 'Cloud Solutions Architect', skills: ['AWS', 'Terraform', 'Kubernetes'], experience: '8+ Years', status: 'Interviewing' },
  { id: 'JD003', title: 'UX/UI Designer', skills: ['Figma', 'User Research', 'Prototyping'], experience: '3+ Years', status: 'Open' },
  { id: 'JD004', title: 'Data Scientist', skills: ['Python', 'TensorFlow', 'SQL'], experience: '4+ Years', status: 'Closed' },
  { id: 'JD005', title: 'Project Manager', skills: ['Agile', 'Scrum', 'JIRA'], experience: '6+ Years', status: 'Open' },
].map(jd => ({...jd, name: jd.title}));

export interface ConsultantProfile {
  id: string;
  name: string;
  title: string;
  skills: string[];
  experience: string;
}

export const consultantProfiles: ConsultantProfile[] = [
    { id: 'CP01', name: 'Elena Rodriguez', title: 'Senior Frontend Developer', skills: ['React', 'TypeScript', 'Next.js', 'Node.js'], experience: '7 Years' },
    { id: 'CP02', name: 'Marcus Chen', title: 'Cloud Solutions Architect', skills: ['AWS', 'Azure', 'GCP', 'Terraform'], experience: '9 Years' },
    { id: 'CP03', name: 'Aisha Khan', title: 'UX/UI Designer', skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research'], experience: '4 Years' },
    { id: 'CP04', name: 'Ben Carter', title: 'Data Scientist', skills: ['Python', 'R', 'PyTorch', 'SQL'], experience: '5 Years' },
    { id: 'CP05', name: 'Olivia Martinez', title: 'Project Manager', skills: ['Agile', 'Scrum', 'Kanban', 'JIRA'], experience: '8 Years' },
];