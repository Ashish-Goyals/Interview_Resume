const pdfParse = require ('pdf-parse');
const {
  generateInterviewReport,
  generateResumePdf,
} = require ('../services/ai.service');
const InterviewReportModel = require ('../models/interviewReport.model');

async function generateInterviewReportController (req, res) {
  try {
    // console.log('Request received:', {
    //   hasFile: !!req.file,
    //   body: req.body,
    //   user: req.user
    // });

    if (!req.file) {
      return res.status (400).json ({
        success: false,
        message: 'Resume file is required',
      });
    }

    const resumeContent = await new pdfParse.PDFParse (
      Uint8Array.from (req.file.buffer)
    ).getText ();

    // console.log('Resume parsed successfully');

    const {selfDescription, jobDescription} = req.body;

    if (!jobDescription) {
      return res.status (400).json ({
        success: false,
        message: 'Job description is required',
      });
    }

    // console.log('Calling AI service...');
    const interviewReportByAi = await generateInterviewReport ({
      resume: resumeContent.text,
      selfDescription: selfDescription || '',
      jobDescription,
    });

    console.log (
      'AI Report Data:',
      JSON.stringify (interviewReportByAi, null, 2)
    );

    const titleMatch =
      jobDescription.match (/Job Title[:\s]+([^\n]+)/i) ||
      jobDescription.match (/^([^\n]+)/);
    const title = titleMatch ? titleMatch[1].trim () : 'Interview Report';

    const interviewReport = await InterviewReportModel.create ({
      userId: req.user.userId,
      resume: resumeContent.text,
      selfDescription: selfDescription || '',
      jobDescription,
      title,
      ...interviewReportByAi,
    });

    // console.log('Report saved successfully:', interviewReport._id);

    res.status (200).json ({
      message: 'Interview report generated successfully',
      success: true,
      interviewReport,
    });
  } catch (error) {
    console.error ('Error in generateInterviewReportController:');
    console.error ('Error name:', error.name);
    console.error ('Error message:', error.message);
    console.error ('Error stack:', error.stack);
    res.status (500).json ({
      success: false,
      message: 'Failed to generate interview report',
      error: error.message,
    });
  }
}

async function getInterviewReportByIdController (req, res) {
  try {
    const {interviewId} = req.params;

    const interviewReport = await InterviewReportModel.findOne ({
      _id: interviewId,
      userId: req.user.userId,
    });
    if (!interviewReport) {
      return res.status (404).json ({
        message: 'Interview report not found',
        success: false,
      });
    }
    res.status (200).json ({
      message: 'Interview report fetched successfully',
      success: true,
      interviewReport,
    });
  } catch (error) {
    console.error ('Error in getInterviewReportByIdController:', error);
    res.status (500).json ({
      success: false,
      message: 'Failed to fetch interview report',
      error: error.message,
    });
  }
}

async function getAllInterviewReportsController (req, res) {
  try {
    // console.log('Fetching reports for user:', req.user.userId);

    const interviewReports = await InterviewReportModel.find ({
      userId: req.user.userId,
    })
      .sort ({createdAt: -1})
      .select ('matchScore createdAt _id title');

    // console.log('Found reports:', interviewReports.length);

    res.status (200).json ({
      message: 'All interview reports fetched successfully',
      success: true,
      interviewReports,
    });
  } catch (error) {
    console.error ('Error in getAllInterviewReportsController:');
    console.error ('Error name:', error.name);
    console.error ('Error message:', error.message);
    console.error ('Error stack:', error.stack);
    res.status (500).json ({
      success: false,
      message: 'Failed to fetch interview reports',
      error: error.message,
    });
  }
}

async function generateResumePdfController (req, res) {
  try {
    const {interviewReportId} = req.params;

    const interviewReport = await InterviewReportModel.findById (
      interviewReportId
    );

    if (!interviewReport) {
      return res.status (404).json ({
        success: false,
        message: 'Interview report not found',
      });
    }

    const {resume, selfDescription, jobDescription} = interviewReport;

    const pdfBuffer = await generateResumePdf ({
      resume,
      selfDescription,
      jobDescription,
    });

    res.set ({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=resume_${interviewReportId}.pdf`,
    });

    res.send (pdfBuffer);
  } catch (error) {
    console.error ('PDF generation error:', error);

    res.status (500).json ({
      success: false,
      message: 'Failed to generate resume PDF',
      error: error.message,
    });
  }
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
