const express = require ('express');
const authMiddleware = require ('../middlewares/auth.middleware');
const interviewRouter = express.Router ();
const interviewController = require ('../controllers/interview.controller');
const upload = require ('../middlewares/file.middleware');
/**
 * @route POST /api/interview
 * @description generate new interview report on the basis of user self description resume pdf and job description
 * @access private
*/

interviewRouter.post (
  '/generate',
  authMiddleware.authUser,
  upload.single ('resume'),
  interviewController.generateInterviewReportController
);

/** 
 * @route GET /api/interview/all
 * @description get all interview reports for the logged in user
 * @access private
 */
interviewRouter.get (
  '/all',
  authMiddleware.authUser,
  interviewController.getAllInterviewReportsController
);

/**
 * @route POST /api/interview/:interviewId/resume
 * @description Download resume PDF for a specific interview report
 * @access private
 */
interviewRouter.post (
  '/resume/pdf/:interviewReportId',
  authMiddleware.authUser,
  interviewController.generateResumePdfController
);

/** 
 * @route GET /api/interview/:interviewId
 * @description get interview report by interview id .
 * @access private
 */

interviewRouter.get (
  '/:interviewId',
  authMiddleware.authUser,
  interviewController.getInterviewReportByIdController
);

module.exports = interviewRouter;
