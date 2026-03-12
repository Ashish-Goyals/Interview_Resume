const {GoogleGenAI} = require ('@google/genai');
const {z} = require ('zod');
const {zodToJsonSchema} = require ('zod-to-json-schema');
const puppeteer = require ('puppeteer');
const ai = new GoogleGenAI ({
  apiKey: process.env.GOOGLE_API_KEY,
});

// async function invokeGeminiAi () {
//   const response = await ai.models.generateContent ({
//     model: 'gemini-2.5-flash',
//     contents: 'Hello Gemini ! What is Interview',
//   });
//   console.log (response.text);
// }

const interviewReportSchema = z.object ({
  matchScore: z
    .number ()
    .describe (
      "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
    ),
  technicalQuestions: z
    .array (
      z.object ({
        question: z
          .string ()
          .describe ('The technical question can be asked in the interview'),
        intention: z
          .string ()
          .describe (
            'The intention of interviewer behind asking this question'
          ),
        answer: z
          .string ()
          .describe (
            'How to answer this question, what points to cover, what approach to take etc.'
          ),
      })
    )
    .describe (
      'Technical questions that can be asked in the interview along with their intention and how to answer them'
    ),
  behavioralQuestions: z
    .array (
      z.object ({
        question: z
          .string ()
          .describe ('The behavioral question can be asked in the interview'),
        intention: z
          .string ()
          .describe (
            'The intention of interviewer behind asking this question'
          ),
        answer: z
          .string ()
          .describe (
            'How to answer this question, what points to cover, what approach to take etc.'
          ),
      })
    )
    .describe (
      'Behavioral questions that can be asked in the interview along with their intention and how to answer them'
    ),
  skillGaps: z
    .array (
      z.object ({
        skill: z
          .string ()
          .describe ('The skill which the candidate is lacking'),
        severity: z
          .enum (['low', 'medium', 'high'])
          .describe (
            "The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances"
          ),
      })
    )
    .describe (
      "List of skill gaps in the candidate's profile along with their severity"
    ),
  preparationPlan: z
    .array (
      z.object ({
        day: z
          .number ()
          .describe ('The day number in the preparation plan, starting from 1'),
        focus: z
          .string ()
          .describe (
            'The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc.'
          ),
        tasks: z
          .array (z.string ())
          .describe (
            'List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.'
          ),
      })
    )
    .describe (
      'A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively'
    ),
  title: z
    .string ()
    .describe (
      'The title of the job for which the interview report is generated'
    ),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `Generate a comprehensive interview report for a candidate based on the following details. Ensure the output is strictly in the specified JSON structure with all fields populated.

Candidate Resume: ${resume}
Candidate Self-Description: ${selfDescription}
Job Description: ${jobDescription}

Output JSON structure:
{
  "matchScore": number (0-100),
  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "severity": "low" | "medium" | "high"
    }
  ],
  "preparationPlan": [
    {
      "day": number,
      "focus": "string",
      "tasks": ["string"]
    }
  ]
}

Provide at least 3-5 items in each array. Do not add extra fields.

IMPORTANT: Return ONLY the JSON object. Do NOT wrap it in markdown code blocks, backticks, or any other formatting. Output raw JSON only.`;

  const response = await ai.models.generateContent ({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  let textResponse = response.text;
  // console.log (textResponse);

  // Strip markdown code blocks if present
  if (textResponse.includes ('```')) {
    textResponse = textResponse
      .replace (/```json\n?/g, '')
      .replace (/```\n?/g, '')
      .trim ();
  }

  return JSON.parse (textResponse);
}

async function generatePdfFormHtml (htmlContent) {
  const browser = await puppeteer.launch ();
  const page = await browser.newPage ();
  await page.setContent (htmlContent, {waitUntil: 'networkidle0'});

  const pdfBuffer = await page.pdf ({
    format: 'A4',
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '15mm',
      right: '15mm',
    },
  });
  await browser.close ();
  return pdfBuffer;
}

async function generateResumePdf({resume, selfDescription, jobDescription}) {
  const resumepdfSchema = z.object ({
    html: z
      .string ()
      .describe (
        'The HTML content of the resume which can be converted to PDF  using libraries like puppeteer'
      ),
  });
  const prompt = `Generate a resume for a candidate with the following details:
     Resume: ${resume}
     Self Description: ${selfDescription}
     Job Description: ${jobDescription}
     the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focuimport zodToJsonSchema from '../../node_modules/zod-to-json-schema/dist/esm/index';
s on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
  `;

  const response = await ai.models.generateContent ({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: zodToJsonSchema (resumepdfSchema),
    },
  });

  const jsonContent = JSON.parse (response.text);
  const pdfBuffer = await generatePdfFormHtml (jsonContent.html);
  return pdfBuffer;
}

module.exports = {generateInterviewReport, generateResumePdf};
