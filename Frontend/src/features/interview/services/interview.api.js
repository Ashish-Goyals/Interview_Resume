import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const generateInterviewReport = async ({
  jobDescription,
  selfDescription,
  resumeFile,
}) => {
  const formData = new FormData();
  formData.append('jobDescription', jobDescription);
  formData.append('selfDescription', selfDescription);
  formData.append('resume', resumeFile);

  const response = await axios.post(
    `${API_URL}/api/interview/generate`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const interviewReportById = async (interviewId) => {
  const response = await axios.get(
    `${API_URL}/api/interview/${interviewId}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const getAllInterviewReports = async () => {
  const response = await axios.get(`${API_URL}/api/interview/all`, {
    withCredentials: true,
  });
  return response.data;
};

export const generateResumePdf = async (interviewReportId) => {
  const response = await axios.post(
    `${API_URL}/api/interview/resume/pdf/${interviewReportId}`,
    {},
    {
      responseType: 'blob',
      withCredentials: true,
    }
  );
  return response.data;
};
