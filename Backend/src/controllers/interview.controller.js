const pdfParse = require ('pdf-parse');
const {generateInterviewReport} = require ('../services/ai.service');
const interviewReportModel = require ('../models/interviewReport.model');
async function generateInterViewReportController (req, res) {
  // const resumeFile = req.file;

  const resumeContent = await pdfParse (req.file.buffer);
  const {selfDescription, jobDescription} = req.body;

  const interViewReportByAi = await generateInterviewReport ({
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
  });
  const interviewReport = await interviewReportModel.create ({
    userId: req.user.id,
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
    ...interViewReportByAi,
  });
  // interviewReport.save ();
  console.log ('inter', interviewReport);
  console.log ('Report by ai', interViewReportByAi);
  res.status (200).json ({
    message: 'Interview report generated successfully',
    success: true,
    interviewReport,
  });
}

module.exports = {generateInterViewReportController};
