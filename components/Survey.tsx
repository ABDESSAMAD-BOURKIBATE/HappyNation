import React, { useState } from 'react';
import { Question, SurveyResponse } from '../types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface SurveyProps {
  onComplete: (responses: SurveyResponse[]) => void;
  isLoading: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'stress',
    text: "How often have you felt overwhelmed by your workload in the past week?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
  },
  {
    id: 2,
    category: 'focus',
    text: "I can work for long periods without being distracted.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  },
  {
    id: 3,
    category: 'satisfaction',
    text: "I feel valued and appreciated at work.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  },
  {
    id: 4,
    category: 'stress',
    text: "Do you struggle to disconnect from work after hours?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
  },
  {
    id: 5,
    category: 'focus',
    text: "How would you rate your energy levels when starting your day?",
    options: ["Very Low", "Low", "Moderate", "High", "Very High"]
  },
  {
    id: 6,
    category: 'satisfaction',
    text: "I feel like I am growing professionally in my current role.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  }
];

const Survey: React.FC<SurveyProps> = ({ onComplete, isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (!selectedOption) return;

    const newResponse: SurveyResponse = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      answer: selectedOption
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);
    setSelectedOption(null);

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(updatedResponses);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Analyzing your responses...</h2>
        <p className="text-gray-500">Generating personalized insights with Gemini AI</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
            <span>Question {currentIndex + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-4
            ${currentQuestion.category === 'stress' ? 'bg-red-100 text-red-600' : 
              currentQuestion.category === 'focus' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}
          `}>
            {currentQuestion.category}
          </span>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 flex items-center justify-between
                  ${selectedOption === option 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700'}
                `}
              >
                <span className="font-medium">{option}</span>
                {selectedOption === option && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!selectedOption}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all
                ${selectedOption 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl translate-y-0' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              `}
            >
              {currentIndex === QUESTIONS.length - 1 ? 'Finish' : 'Next'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey;