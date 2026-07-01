import React, { useState, useEffect, useRef } from 'react';
import { Award, Clock, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, X, ChevronRight } from 'lucide-react';

export default function QuizTaker({ 
  quizzes, 
  submissions, 
  courses, 
  currentStudentId, 
  onSubmitQuiz 
}) {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [quizFinished, setQuizFinished] = useState(false);
  const [gradedScore, setGradedScore] = useState(null);
  const [lastSubmissionDetails, setLastSubmissionDetails] = useState(null);

  const timerRef = useRef(null);
  const answersRef = useRef(answers);
  const activeQuizRef = useRef(activeQuiz);
  const quizFinishedRef = useRef(quizFinished);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    activeQuizRef.current = activeQuiz;
  }, [activeQuiz]);

  useEffect(() => {
    quizFinishedRef.current = quizFinished;
  }, [quizFinished]);

  // Filter quizzes that have already been taken by this student
  const getQuizStatus = (quizId) => {
    const sub = submissions.find(s => s.taskId === quizId && s.studentId === currentStudentId && s.type === 'quiz');
    return sub ? { taken: true, score: sub.score, isReleased: sub.isReleased || sub.is_released } : { taken: false };
  };

  // Start the quiz
  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setTimeLeft(quiz.timeLimit * 60);
    setQuizFinished(false);
    setGradedScore(null);
  };

  // Timer & Anti-Cheating Effect
  useEffect(() => {
    if (activeQuiz && !quizFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    const handleVisibilityChange = () => {
      if (document.hidden && activeQuizRef.current && !quizFinishedRef.current) {
        alert("Anti-Cheating Violation: Tab switching or browser minimization is prohibited during quizzes. Your quiz is being auto-submitted immediately.");
        submitQuizAnswers(true, answersRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeQuiz, quizFinished]);

  // Submit helper when timer runs out
  const handleAutoSubmit = () => {
    alert("Time is up! Your quiz is being auto-submitted.");
    submitQuizAnswers(true);
  };

  // Regular submit button
  const handleManualSubmit = () => {
    const unansweredCount = activeQuiz.questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Do you still want to submit?`)) {
        return;
      }
    } else {
      if (!window.confirm("Are you sure you want to finish and submit the quiz?")) {
        return;
      }
    }
    submitQuizAnswers(false);
  };

  // Core submission evaluation
  const submitQuizAnswers = (isAutoSubmit, answersOverride) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const currentAnswers = answersOverride || answers;
    let correctCount = 0;
    const questions = activeQuiz.questions;
    
    // Grade the questions
    const questionReview = questions.map(q => {
      const studentAnsIdx = currentAnswers[q.id];
      const isCorrect = studentAnsIdx !== undefined && parseInt(studentAnsIdx) === q.correctOptionIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        studentAnswer: studentAnsIdx !== undefined ? q.options[studentAnsIdx] : 'No Answer',
        correctAnswer: q.options[q.correctOptionIndex],
        isCorrect
      };
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    
    // Save to App state
    onSubmitQuiz(activeQuiz.id, scorePercent);

    setGradedScore(scorePercent);
    setLastSubmissionDetails(questionReview);
    setQuizFinished(true);
  };

  const handleSelectOption = (qId, optionIdx) => {
    setAnswers({
      ...answers,
      [qId]: optionIdx
    });
  };

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Active testing viewport
  if (activeQuiz) {
    const currentQuestion = activeQuiz.questions[currentQuestionIdx];
    const isFirstQuestion = currentQuestionIdx === 0;
    const isLastQuestion = currentQuestionIdx === activeQuiz.questions.length - 1;
    const progressPercent = Math.round(((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100);

    // Review Results View
    if (quizFinished) {
      return (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px', marginBottom: '24px' }}>
            <CheckCircle size={56} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Quiz Submitted!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Your answers have been securely recorded on the assessment server.
            </p>

            <div className="card" style={{ 
              padding: '16px 20px', 
              backgroundColor: 'rgba(10, 92, 54, 0.04)', 
              borderLeft: '4px solid var(--primary)', 
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 24px'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
                🔒 Grade Release Policy Enabled
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                For academic integrity, scores are hidden until reviewed and released by your course lecturer. You will see your score in your Academic Gradebook once it is officially published.
              </span>
            </div>

            <button className="btn btn-primary" onClick={() => setActiveQuiz(null)}>
              Return to Quizzes
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Quiz Taker Nav bar */}
        <div className="quiz-taker-header">
          <div>
            <span className="badge badge-primary">Taking Quiz</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '4px' }}>{activeQuiz.title}</h2>
          </div>
          <div className="timer-box" style={{ 
            backgroundColor: timeLeft < 60 ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.08)',
            color: timeLeft < 60 ? 'var(--color-danger)' : 'inherit'
          }}>
            <Clock size={20} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress Fill bar */}
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Question Panel */}
        <div className="question-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: '700' }}>
            <span>Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}</span>
            <span>Progress: {progressPercent}%</span>
          </div>

          <h3 className="question-text">{currentQuestion.text}</h3>

          <div className="options-list">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion.id] === idx;
              return (
                <button
                  key={idx}
                  className={`option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(currentQuestion.id, idx)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Quick circular question jump navigation */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            {activeQuiz.questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentQuestionIdx;
              
              let btnStyle = {
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: '700',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                cursor: 'pointer'
              };

              if (isCurrent) {
                btnStyle.borderColor = 'var(--primary)';
                btnStyle.borderWidth = '2px';
                btnStyle.background = 'rgba(10, 92, 54, 0.08)';
              } else if (isAnswered) {
                btnStyle.background = 'var(--primary)';
                btnStyle.color = 'white';
                btnStyle.borderColor = 'var(--primary)';
              }

              return (
                <button 
                  key={q.id} 
                  style={btnStyle}
                  onClick={() => setCurrentQuestionIdx(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Wizard Navigation Footer */}
          <div className="wizard-footer">
            <button 
              className="btn btn-outline" 
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              disabled={isFirstQuestion}
              style={{ opacity: isFirstQuestion ? 0.4 : 1, cursor: isFirstQuestion ? 'not-allowed' : 'pointer' }}
            >
              <ArrowLeft size={16} />
              Previous
            </button>

            {isLastQuestion ? (
              <button className="btn btn-secondary" style={{ color: 'black' }} onClick={handleManualSubmit}>
                Finish & Submit
                <CheckCircle size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setCurrentQuestionIdx(prev => prev + 1)}>
                Next
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quizzes list view (standard student portal view)
  return (
    <div>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Available Course Quizzes</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Complete quizzes before deadlines. Timed sessions automatically submit upon expiry.
        </p>
      </div>

      <div className="grid-container" style={{ marginTop: '24px' }}>
        {quizzes.map(quiz => {
          const status = getQuizStatus(quiz.id);
          const course = courses.find(c => c.id === quiz.courseId);

          return (
            <div key={quiz.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-primary">{course ? course.code : 'General'}</span>
                  <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {quiz.timeLimit} mins
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px' }}>{quiz.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {quiz.description || 'Read instructions carefully before beginning.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {status.taken ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                      {status.isReleased ? (
                        <>Score: <span style={{ color: 'var(--primary)' }}>{status.score}%</span></>
                      ) : (
                        <span style={{ color: 'var(--color-warning)', fontSize: '0.8rem' }}>Grade Pending Release</span>
                      )}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {quiz.questions.length} questions
                  </span>
                )}

                {status.taken ? (
                  <button className="btn btn-outline btn-sm" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                    Completed
                  </button>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => handleStartQuiz(quiz)}>
                    Start Quiz
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {quizzes.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
            <Award size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>No Active Quizzes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Check back later or ask your lecturer for active schedules.</p>
          </div>
        )}
      </div>
    </div>
  );
}
