import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelNames = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];
const MAX_RETRIES = 2;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateWithFallback = async (prompt) => {
  const errors = [];

  for (const modelName of modelNames) {
    const model = genAI.getGenerativeModel({ model: modelName });
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const result = await model.generateContent(prompt);
        const text = result?.response?.text ? result.response.text().trim() : '';
        if (!text) {
          throw new Error('Empty AI response');
        }
        return { text, modelName };
      } catch (err) {
        const message = err?.message || err?.toString() || 'Unknown error';
        console.error(`Gemini attempt failed: model=${modelName} attempt=${attempt}`, message, err);
        errors.push(`${modelName} attempt ${attempt}: ${message}`);
        if (attempt < MAX_RETRIES) {
          await sleep(500 * attempt);
        }
      }
    }
  }

  throw new Error(`All Gemini models failed: ${modelNames.join(', ')}. ${errors.join(' | ')}`);
};

export const chatWithAI = async (req, res) => {
  console.log(`chatWithAI called: ${req.method} ${req.originalUrl}`, req.body);
  try {
    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ message: 'Message and userId are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's applications
    const applications = await Application.find({ student: userId }).populate('opportunity');

    // Get all opportunities (or filter based on user preferences)
    const opportunities = await Opportunity.find({ status: 'Active' });

    // Craft context for AI
    const context = {
      user: {
        name: user.fullName,
        department: user.department,
        year: user.year,
        role: user.role,
      },
      applications: applications.map(app => ({
        opportunityTitle: app.opportunity?.title,
        status: app.status,
        appliedDate: app.appliedDate,
      })),
      opportunities: opportunities.slice(0, 10).map(opp => ({
        title: opp.title,
        category: opp.category,
        domain: opp.domain,
        organization: opp.organization,
        deadline: opp.deadline,
        skills: opp.skills,
      })),
    };

    // Create prompt for AI
    const prompt = `
You are a helpful AI assistant for a campus opportunity platform called Campus Bridge. You help students find opportunities, track applications, and provide guidance.

User Information:
- Name: ${context.user.name}
- Department: ${context.user.department}
- Year: ${context.user.year}

User's Applications:
${context.applications.map(app => `- ${app.opportunityTitle}: ${app.status} (Applied: ${new Date(app.appliedDate).toLocaleDateString()})`).join('\n')}

Available Opportunities (sample):
${context.opportunities.map(opp => `- ${opp.title} (${opp.category}) by ${opp.organization} in ${opp.domain} domain, deadline: ${new Date(opp.deadline).toLocaleDateString()}`).join('\n')}

User's question: ${message}

Please provide a helpful, concise response based on the available data. If the question is about opportunities, reference specific ones. If about applications, mention their status. Keep responses friendly and encouraging.
`;

    // Call Gemini API with retries and fallbacks
    const result = await generateWithFallback(prompt);
    res.json({ response: result.text, model: result.modelName });

  } catch (error) {
    console.error('Chat error:', error);
    const errorMsg = error?.message || error?.toString() || 'Unknown error';
    res.status(500).json({ message: `Error processing chat request: ${errorMsg}` });
  }
};