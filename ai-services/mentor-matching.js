require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Generate mentor recommendations based on user profile and goals
 * @param {Object} userProfile - User profile information
 * @param {Object} careerGoals - User's career goals and interests
 * @returns {Array} - List of recommended mentors with matching scores
 */
async function generateMentorRecommendations(userProfile, careerGoals) {
  try {
    const prompt = `
      Given the following user profile and career goals, recommend potential mentors:
      
      User Profile:
      ${JSON.stringify(userProfile, null, 2)}
      
      Career Goals:
      ${JSON.stringify(careerGoals, null, 2)}
      
      Provide mentor recommendations in JSON format with the following structure:
      [
        {
          "mentorId": "uniqueId",
          "matchScore": 0.95,
          "matchReason": "Strong alignment in AI technology experience and leadership goals"
        }
      ]
    `;

    const response = await openai.createCompletion({
      model: "gpt-4",
      prompt: prompt,
      max_tokens: 1000,
      temperature: 0.5,
    });

    // Parse the response to extract the recommended mentors
    const result = JSON.parse(response.data.choices[0].text.trim());
    return result;
  } catch (error) {
    console.error('Error generating mentor recommendations:', error);
    throw error;
  }
}

/**
 * Analyze career path options based on user skills and interests
 * @param {Object} userProfile - User profile with skills and experience
 * @returns {Array} - Recommended career paths with explanations
 */
async function analyzeCareerPaths(userProfile) {
  try {
    const prompt = `
      Given the following user profile with skills and experience, suggest potential career paths:
      
      User Profile:
      ${JSON.stringify(userProfile, null, 2)}
      
      Provide career path recommendations in JSON format with the following structure:
      [
        {
          "pathName": "Data Science Leader",
          "alignment": 0.92,
          "explanation": "Your strong background in statistics and machine learning aligns well with this path",
          "nextSteps": ["Gain experience leading ML projects", "Develop mentoring skills"]
        }
      ]
    `;

    const response = await openai.createCompletion({
      model: "gpt-4",
      prompt: prompt,
      max_tokens: 1000,
      temperature: 0.5,
    });

    // Parse the response to extract the recommended career paths
    const result = JSON.parse(response.data.choices[0].text.trim());
    return result;
  } catch (error) {
    console.error('Error analyzing career paths:', error);
    throw error;
  }
}

module.exports = {
  generateMentorRecommendations,
  analyzeCareerPaths
};
