export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type User = { id: string; name: string; email: string };
export type Attachment = { _id: string; url: string; originalName: string; publicId: string };
export type Task = {
  _id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  location?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
};

export type Weather = {
  location: string;
  country?: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon?: string;
  fetchedAt: string;
};
