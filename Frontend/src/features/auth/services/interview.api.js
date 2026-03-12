import axios from 'axios';
import Interview from '../../interview/pages/Interview';

const api = axios.create ({
  baseUrl: 'http://localhost:3000',
  withCredentials: true,
});

/** 
 * @description This function is used to generate interview report by sending job description self description and resume file to the backend.
  */

export const generateInterviewReport = async ({
  jobDescription,
  selfDescription,
  resumeFile,
}) => {
  const formData = new FormData ();
  formData.append ('jobDescription', jobDescription);
  formData.append ('selfDescription', selfDescription);
  formData.append ('resumeFile', resumeFile);

  const response = await api.post ('/interview-reports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**  
 * @description This function is used to get interview report by id by sending interview id to the backend.
 */

export const interviewReportById = async interviewId => {
  const response = await api.get (`/api/Interview/report/${interviewId}`);
  return response.data;
};

/** 
 * @description This function is used to get all interview reports for the logged in user by sending a request to the backend.
 */

export const getAllInterviewReports = async () => {
  const response = await api.get ('/api/interview');
  return response.data;
};
