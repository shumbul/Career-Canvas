import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import azureOpenAIService from '../services/azureOpenAI';
import mongoService from '../services/mongoService';

interface VideoMockInterviewProps {
  onNavigateHome?: () => void;
}

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface InterviewSession {
  id: string;
  userId: string;
  topic: string;
  startTime: Date;
  endTime?: Date;
  questions: InterviewQuestion[];
  responses: Array<{
    questionId: string;
    answer: string;
    confidence: number;
    feedback: string;
    score: number;
    strengths: string[];
    improvements: string[];
    timestamp: Date;
  }>;
  overallScore?: number;
  feedback?: string;
}

const VideoMockInterview: React.FC<VideoMockInterviewProps> = ({ onNavigateHome }) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [speechError, setSpeechError] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const [selectedCareerLevel, setSelectedCareerLevel] = useState<string>('');

  // Career levels
  const careerLevels = [
    { id: 'early-career', name: 'Early Career', description: '0-3 years experience, entry-level positions' },
    { id: 'mid-career', name: 'Mid Career', description: '4-8 years experience, senior individual contributor' },
    { id: 'senior-career', name: 'Senior Career', description: '8+ years experience, leadership and executive roles' }
  ];

  // Interview topics
  const topics = [
    { id: 'behavioral', name: 'Behavioral Questions', description: 'Situation-based questions about your experience' },
    { id: 'technical', name: 'Technical Skills', description: 'Role-specific technical questions' },
    { id: 'system-design', name: 'System Design', description: 'Architecture and design problems' },
    { id: 'leadership', name: 'Leadership', description: 'Questions about leading teams and projects' },
    { id: 'general', name: 'General Questions', description: 'Common interview questions' }
  ];

  // Comprehensive cleanup function for media resources
  const cleanupMediaResources = () => {
    console.log('Performing comprehensive media cleanup');
    
    // Stop all media streams
    if (stream) {
      stream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
          console.log(`Stopped ${track.kind} track`);
        }
      });
      setStream(null);
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    
    // Stop media recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping media recorder:', error);
      }
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Initialize camera and microphone
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Please allow camera and microphone access to use the video interview feature.');
      }
    };

    initializeMedia();

    // Initialize speech recognition with improved error handling
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptSegment + ' ';
          } else {
            interimTranscript += transcriptSegment;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => {
            const newTranscript = prev + finalTranscript;
            // Save transcript in real-time to MongoDB
            if (interviewSession && currentQuestion) {
              mongoService.saveTranscript(
                interviewSession.id, 
                currentQuestion.id, 
                finalTranscript.trim(), 
                event.results[event.results.length - 1][0].confidence * 100
              );
            }
            return newTranscript;
          });
        }
      };

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        // Auto-restart if interview is still in progress
        if (interviewStarted && isRecording) {
          setTimeout(() => {
            if (recognitionRef.current && interviewStarted) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Error restarting speech recognition:', error);
              }
            }
          }, 100);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Handle different error types
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert('Microphone access is required for voice recognition. Please allow microphone access and try again.');
        } else if (event.error === 'network') {
          console.log('Network error, will retry...');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, continuing...');
        }
        
        // Auto-restart on recoverable errors
        if (interviewStarted && ['network', 'no-speech', 'audio-capture'].includes(event.error)) {
          setTimeout(() => {
            if (recognitionRef.current && interviewStarted) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Error restarting after error:', error);
              }
            }
          }, 1000);
        }
      };

      recognitionRef.current.onnomatch = () => {
        console.log('No speech match found');
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
      alert('Speech recognition is not supported in your browser. Please use Chrome, Safari, or Edge for the best experience.');
    }

    // Cleanup function for component unmount or navigation away
    return () => {
      console.log('Cleaning up VideoMockInterview component');
      
      // Stop all media tracks (camera and microphone)
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped ${track.kind} track`);
        });
      }
      
      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('Speech recognition stopped');
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
      
      // Stop any ongoing media recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
          console.log('Media recorder stopped');
        } catch (error) {
          console.error('Error stopping media recorder:', error);
        }
      }
      
      // Clear video element source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Handle page visibility changes and navigation away
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Page hidden - pausing media streams');
        // Optionally pause recording or show a warning
      } else {
        console.log('Page visible again');
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (interviewStarted) {
        const message = 'Your interview is still in progress. Are you sure you want to leave?';
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [interviewStarted]);

  // Listen for focus/blur events to handle tab switching
  useEffect(() => {
    const handleFocusChange = () => {
      // If the window loses focus and interview is active, warn user
      if (document.hidden && interviewStarted) {
        console.log('Window lost focus during interview');
        // Could pause interview or show warning
      }
    };

    const handleTabFocus = () => {
      if (!document.hidden && interviewStarted) {
        console.log('Returned to interview tab');
      }
    };

    document.addEventListener('visibilitychange', handleFocusChange);
    window.addEventListener('focus', handleTabFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleFocusChange);
      window.removeEventListener('focus', handleTabFocus);
    };
  }, [interviewStarted]);

  // Cleanup when component unmounts (navigation away from tab)
  useEffect(() => {
    return () => {
      console.log('VideoMockInterview component unmounting - performing complete cleanup');
      cleanupMediaResources();
    };
  }, []); // Empty dependency array ensures this only runs on mount/unmount

  // Start interview session
  const startInterview = async () => {
    if (!selectedTopic || !selectedCareerLevel || !user) return;

    setLoading(true);
    try {
      // Generate questions for the selected topic and career level
      const combinedTopic = `${selectedCareerLevel}-${selectedTopic}`;
      const questions = await generateInterviewQuestions(combinedTopic);
      
      // Create interview session in MongoDB
      const session = await mongoService.createInterviewSession(user.id, combinedTopic, questions);

      setInterviewSession(session);
      setCurrentQuestion(questions[0]);
      setQuestionIndex(0);
      setInterviewStarted(true);
      setIsRecording(true);
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }

      // Start recording
      if (stream && mediaRecorderRef.current) {
        mediaRecorderRef.current.start();
      }

    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate interview questions based on topic
  const generateInterviewQuestions = async (topic: string): Promise<InterviewQuestion[]> => {
    try {
      // Generate multiple questions using Azure OpenAI service
      const questions: InterviewQuestion[] = [];
      for (let i = 0; i < 3; i++) {
        const question = await azureOpenAIService.getAIQuestion(topic, questions);
        questions.push(question);
      }
      return questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback to static questions if AI service fails
      const fallbackQuestions: InterviewQuestion[] = [
        { id: `${topic}_1`, question: `Tell me about your experience with ${topic}.`, category: topic, difficulty: 'medium' },
        { id: `${topic}_2`, question: `What challenges have you faced in ${topic}?`, category: topic, difficulty: 'medium' },
        { id: `${topic}_3`, question: `How do you stay updated with ${topic} trends?`, category: topic, difficulty: 'easy' }
      ];
      return fallbackQuestions;
    }
  };

  // Move to next question
  const nextQuestion = async () => {
    if (!interviewSession || !currentQuestion) return;

    // Save current response
    const evaluation = await generateFeedback(currentQuestion.question, transcript, currentQuestion.category);
    const response = {
      questionId: currentQuestion.id,
      answer: transcript,
      confidence: evaluation.confidence,
      feedback: evaluation.feedback,
      score: evaluation.score,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      timestamp: new Date()
    };

    const updatedSession = {
      ...interviewSession,
      responses: [...interviewSession.responses, response]
    };
    setInterviewSession(updatedSession);

    // Save response to MongoDB
    await mongoService.updateSessionResponse(interviewSession.id, response);

    // Save transcript to MongoDB
    await mongoService.saveTranscript(interviewSession.id, currentQuestion.id, transcript, evaluation.confidence);

    // Move to next question or end interview
    if (questionIndex + 1 < interviewSession.questions.length) {
      setQuestionIndex(questionIndex + 1);
      setCurrentQuestion(interviewSession.questions[questionIndex + 1]);
      setTranscript('');
    } else {
      endInterview();
    }
  };

  // Generate feedback for response
  const generateFeedback = async (question: string, answer: string, category: string): Promise<any> => {
    try {
      // Use Azure OpenAI service to evaluate response
      const evaluation = await azureOpenAIService.evaluateAIResponse(question, answer, category);
      return evaluation;
    } catch (error) {
      console.error('Error generating feedback:', error);
      // Fallback feedback
      return {
        score: 70,
        feedback: "Good response. Try to provide more specific examples.",
        strengths: ["Clear communication"],
        improvements: ["Add more details"],
        confidence: 75
      };
    }
  };

  // End interview session
  const endInterview = async () => {
    console.log('Ending interview - cleaning up resources');
    
    setIsRecording(false);
    setIsListening(false);
    setInterviewStarted(false);

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }

    // Stop media recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping media recorder:', error);
      }
    }

    if (interviewSession) {
      // Generate overall feedback using Azure OpenAI
      const overallFeedback = await azureOpenAIService.generateOverallFeedback(
        interviewSession.responses.map(r => ({
          question: interviewSession.questions.find(q => q.id === r.questionId)?.question || '',
          answer: r.answer,
          score: r.score
        }))
      );

      // Calculate average score
      const overallScore = interviewSession.responses.length > 0 
        ? Math.round(interviewSession.responses.reduce((sum, r) => sum + r.score, 0) / interviewSession.responses.length)
        : 70;

      // Complete session in MongoDB
      await mongoService.completeInterviewSession(interviewSession.id, overallScore, overallFeedback);

      const finalSession = {
        ...interviewSession,
        endTime: new Date(),
        overallScore,
        feedback: overallFeedback
      };

      setInterviewSession(finalSession);
      setFeedback(overallFeedback);
    }
  };

  // Manual voice recognition control
  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setSpeechError('');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setSpeechError('Failed to start voice recognition. Please check your microphone.');
      }
    }
  };

  // Reset interview
  const resetInterview = () => {
    setInterviewSession(null);
    setCurrentQuestion(null);
    setQuestionIndex(0);
    setTranscript('');
    setSelectedTopic('');
    setSelectedCareerLevel('');
    setInterviewStarted(false);
    setFeedback('');
    setSpeechError('');
  };

  if (!interviewStarted && !interviewSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">AI Video Interview Practice</h1>
            <p className="text-xl text-gray-600">Practice with our AI interviewer to improve your interview skills</p>
          </div>

          {/* Setup Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interview Setup</h2>
              
              {/* Camera Preview */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Camera & Microphone Check</h3>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    Camera Preview
                  </div>
                </div>
              </div>

              {/* Career Level Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Select Your Career Level</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {careerLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedCareerLevel(level.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                        selectedCareerLevel === level.id
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-800">{level.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Select Interview Topic</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                        selectedTopic === topic.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-800">{topic.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <button
                  onClick={startInterview}
                  disabled={!selectedTopic || !selectedCareerLevel || loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center gap-3 mx-auto"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Starting Interview...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Start Interview
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (interviewSession && !interviewStarted) {
    // Show results
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Interview Complete!</h2>
              
              <div className="mb-8 text-center">
                <div className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-full text-xl font-semibold">
                  Score: {interviewSession.overallScore}/100
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Overall Feedback</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{feedback}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Interview Review</h3>
                <div className="space-y-6">
                  {interviewSession.responses.map((response, index) => {
                    const question = interviewSession.questions.find(q => q.id === response.questionId);
                    return (
                      <div key={response.questionId} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Question Header */}
                        <div className="bg-gray-50 p-4 border-b">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 mb-2">
                                Question {index + 1}: {question?.question}
                              </h4>
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {question?.category}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  question?.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                  question?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {question?.difficulty}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className={`text-2xl font-bold ${
                                response.score >= 80 ? 'text-green-600' :
                                response.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {response.score}/100
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Answer and Feedback */}
                        <div className="p-4">
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-700 mb-2">Your Answer:</h5>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-700 whitespace-pre-wrap">{response.answer || 'No answer recorded'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Strengths */}
                            {response.strengths && response.strengths.length > 0 && (
                              <div>
                                <h5 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Strengths
                                </h5>
                                <ul className="space-y-1">
                                  {response.strengths.map((strength, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Areas for Improvement */}
                            {response.improvements && response.improvements.length > 0 && (
                              <div>
                                <h5 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Areas for Improvement
                                </h5>
                                <ul className="space-y-1">
                                  {response.improvements.map((improvement, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                                      {improvement}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Detailed Feedback */}
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="font-medium text-blue-700 mb-2">AI Feedback:</h5>
                            <p className="text-sm text-gray-700">{response.feedback}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Overall Performance Summary */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{interviewSession.responses.length}</div>
                      <div className="text-sm text-gray-600">Questions Answered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {Math.round(interviewSession.responses.reduce((sum, r) => sum + r.confidence, 0) / interviewSession.responses.length)}%
                      </div>
                      <div className="text-sm text-gray-600">Avg. Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {Math.round((Date.now() - new Date(interviewSession.startTime).getTime()) / 60000)}
                      </div>
                      <div className="text-sm text-gray-600">Minutes</div>
                    </div>
                  </div>
                  
                  {/* Category Breakdown */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Performance by Category:</h4>
                    <div className="space-y-2">
                      {Object.entries(
                        interviewSession.responses.reduce((acc, response) => {
                          const question = interviewSession.questions.find(q => q.id === response.questionId);
                          const category = question?.category || 'unknown';
                          if (!acc[category]) {
                            acc[category] = { scores: [], count: 0 };
                          }
                          acc[category].scores.push(response.score);
                          acc[category].count++;
                          return acc;
                        }, {} as Record<string, { scores: number[], count: number }>)
                      ).map(([category, data]) => {
                        const avgScore = Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.count);
                        return (
                          <div key={category} className="flex items-center justify-between p-2 bg-white rounded">
                            <span className="capitalize text-sm font-medium text-gray-700">{category.replace('-', ' ')}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    avgScore >= 80 ? 'bg-green-500' : avgScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${avgScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-600 w-12">{avgScore}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-x-4">
                <button
                  onClick={resetInterview}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Practice Again
                </button>
                <button
                  onClick={onNavigateHome}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview in progress
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
                <h3 className="font-semibold">Interview in Progress</h3>
                <div className="flex items-center gap-2">
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Recording</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative bg-gray-900" style={{ aspectRatio: '16/9' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* AI Avatar */}
                <div className="absolute top-4 right-4 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              {/* Live Captions */}
              <div className="p-4 bg-gray-50 border-t">
                <h4 className="font-medium text-gray-700 mb-2">Live Captions:</h4>
                <div className="bg-white p-3 rounded-lg border min-h-[60px] text-gray-600">
                  {transcript || "Start speaking to see live captions..."}
                </div>
              </div>
            </div>
          </div>

          {/* Interview Panel */}
          <div className="space-y-6">
            {/* Current Question */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Question {questionIndex + 1} of {interviewSession?.questions.length}
              </h3>
              
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((questionIndex + 1) / (interviewSession?.questions.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-800 font-medium">{currentQuestion?.question}</p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="px-2 py-1 bg-gray-200 rounded-full text-xs font-medium text-gray-700">
                  {currentQuestion?.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentQuestion?.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  currentQuestion?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentQuestion?.difficulty}
                </span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={nextQuestion}
                  disabled={!transcript.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  {questionIndex + 1 === interviewSession?.questions.length ? 'Finish Interview' : 'Next Question'}
                </button>
                
                <button
                  onClick={endInterview}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  End Interview
                </button>
              </div>
            </div>

            {/* Voice Recognition Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Voice Recognition</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isListening ? 'Listening...' : 'Not listening'}
                  </span>
                </div>
                
                {speechError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{speechError}</p>
                  </div>
                )}
                
                <button
                  onClick={toggleVoiceRecognition}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isListening ? 'Stop Listening' : 'Start Listening'}
                </button>
                
                <div className="text-xs text-gray-500">
                  <p>💡 Tips for better recognition:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Speak clearly and at normal pace</li>
                    <li>Ensure quiet environment</li>
                    <li>Keep microphone close</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoMockInterview;