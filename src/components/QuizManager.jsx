import React, { useState } from 'react';
import { PlusCircle, Award, Users, Clock, AlertCircle, X, ChevronRight, Check, Trash } from 'lucide-react';

export default function QuizManager({ 
  courses, 
  quizzes, 
  submissions, 
  users, 
  onAddQuiz,
  onReleaseQuizScore,
  onReleaseAllQuizScores
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuizForStats, setSelectedQuizForStats] = useState(null);
  
  // Form State
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(10);
  
  // Authoring Questions State
  const [questions, setQuestions] = useState([]);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('mcq'); // 'mcq' or 'tf'
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('0'); // Index 0-3 for MCQ, '0' or '1' for TF
  const [qPoints, setQPoints] = useState(5);
  const [errors, setErrors] = useState({});

  const handleAddQuestion = () => {
    if (!qText.trim()) {
      alert('Question text cannot be empty.');
      return;
    }

    let questionOpts = [];
    if (qType === 'mcq') {
      if (options.some(opt => !opt.trim())) {
        alert('Please fill out all MCQ options.');
        return;
      }
      questionOpts = [...options];
    } else {
      questionOpts = ['True', 'False'];
    }

    const newQuestion = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      text: qText,
      type: qType,
      points: parseInt(qPoints) || 1,
      options: questionOpts,
      correctOptionIndex: parseInt(correctAnswer)
    };

    setQuestions([...questions, newQuestion]);
    
    // Clear Question inputs
    setQText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('0');
    setQPoints(5);
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSaveQuiz = (e) => {
    e.preventDefault();
    
    // Validate
    const formErrors = {};
    if (!title.trim()) formErrors.title = 'Title is required';
    if (questions.length === 0) formErrors.questions = 'At least one question is required';
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const newQuiz = {
      id: 'quiz_' + Date.now().toString(),
      courseId,
      title,
      description,
      timeLimit: parseInt(timeLimit),
      questions
    };

    onAddQuiz(newQuiz);
    
    // Reset Form
    setTitle('');
    setDescription('');
    setTimeLimit(10);
    setQuestions([]);
    setErrors({});
    setShowCreateModal(false);
  };

  // Get statistics for a quiz
  const getQuizStats = (quizId) => {
    const quizSubmissions = submissions.filter(sub => sub.taskId === quizId && sub.type === 'quiz');
    const totalCount = quizSubmissions.length;
    
    if (totalCount === 0) {
      return { totalCount, avgScore: 0, highestScore: 0, lowestScore: 0, list: [] };
    }

    const scores = quizSubmissions.map(sub => sub.score);
    const avgScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalCount);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    const detailedList = quizSubmissions.map(sub => {
      const student = users.find(u => u.id === sub.studentId);
      return {
        ...sub,
        studentName: student ? student.name : 'Unknown Student',
        studentEmail: student ? student.email : 'N/A'
      };
    });

    return { totalCount, avgScore, highestScore, lowestScore, list: detailedList };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Manage Quizzes</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Publish quizzes, configure online auto-grading, and review results.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <PlusCircle size={18} />
          Create New Quiz
        </button>
      </div>

      {/* Main Quizzes List */}
      <div className="grid-container">
        {quizzes.map(quiz => {
          const course = courses.find(c => c.id === quiz.courseId);
          const stats = getQuizStats(quiz.id);
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
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {quiz.description || 'No description provided.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span>Questions: <strong>{quiz.questions.length}</strong></span>
                  <span>Taken by: <strong>{stats.totalCount} students</strong></span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ flexGrow: 1 }}
                    onClick={() => setSelectedQuizForStats(quiz)}
                  >
                    View Submissions
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {quizzes.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
            <Award size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>No Quizzes Published</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Get started by creating your first online quiz.</p>
          </div>
        )}
      </div>

      {/* Stats and Submission Viewer Modal */}
      {selectedQuizForStats && (() => {
        const stats = getQuizStats(selectedQuizForStats.id);
        const course = courses.find(c => c.id === selectedQuizForStats.courseId);
        return (
          <div className="modal-overlay" onClick={() => setSelectedQuizForStats(null)}>
            <div className="modal-content" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '4px' }}>{course ? course.code : 'Course'}</span>
                  <h3 style={{ fontSize: '1.3rem' }}>Submissions: {selectedQuizForStats.title}</h3>
                </div>
                <button className="modal-close" onClick={() => setSelectedQuizForStats(null)}>
                  <X size={20} />
                </button>
              </div>

              {/* Stats Overview */}
              <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div className="card" style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-title)' }}>{stats.totalCount}</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Taken</p>
                </div>
                <div className="card" style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.avgScore}%</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Score</p>
                </div>
                <div className="card" style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-success)' }}>{stats.highestScore}%</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Score</p>
                </div>
                <div className="card" style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-danger)' }}>{stats.lowestScore}%</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low Score</p>
                </div>
              </div>

              {/* Student Log Table */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Student Log</h4>
                {stats.list.some(sub => !(sub.isReleased || sub.is_released)) && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => onReleaseAllQuizScores(selectedQuizForStats.id)}
                    style={{ fontSize: '0.75rem', height: '32px' }}
                  >
                    Release All Scores
                  </button>
                )}
              </div>
              <div className="grade-table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="grade-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Group</th>
                      <th>Date Completed</th>
                      <th>Correct / Total</th>
                      <th>Percentage Score</th>
                      <th>Score Release</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.list.map(sub => {
                      const student = users.find(u => u.id === sub.studentId);
                      const correctCount = Math.round((sub.score / 100) * selectedQuizForStats.questions.length);
                      const isScoreReleased = sub.isReleased || sub.is_released;
                      return (
                        <tr key={sub.id}>
                          <td style={{ fontWeight: '600' }}>{sub.studentName}</td>
                          <td>{student?.groupName || 'No Group'}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub.submittedAt || 'Today'}</td>
                          <td style={{ fontWeight: '700' }}>{correctCount} / {selectedQuizForStats.questions.length}</td>
                          <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{sub.score}%</td>
                          <td>
                            {isScoreReleased ? (
                              <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px', display: 'inline-block' }}>Released</span>
                            ) : (
                              <button 
                                className="btn btn-outline btn-sm"
                                onClick={() => onReleaseQuizScore(sub.id)}
                                style={{ fontSize: '0.7rem', padding: '2px 8px', height: '24px', lineHeight: '20px' }}
                              >
                                Release Score
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {stats.list.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                          No student has completed this quiz yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <button className="btn btn-outline" onClick={() => setSelectedQuizForStats(null)}>
                  Close Review
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.3rem' }}>Create Online Quiz</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz}>
              <div className="form-group">
                <label className="form-label">Course Association</label>
                <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)}>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quiz Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Midterm Test 1" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                {errors.title && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Description / Instructions</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Explain instructions, number of questions, grading rule..." 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ width: '50%' }}>
                <label className="form-label">Time Limit (Minutes)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="1" 
                  max="120"
                  value={timeLimit}
                  onChange={e => setTimeLimit(e.target.value)}
                />
              </div>

              {/* Questions Authoring Section */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', margin: '20px 0', backgroundColor: 'rgba(10, 92, 54, 0.02)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} style={{ color: 'var(--primary)' }} />
                  Questions Added: {questions.length}
                </h4>

                {/* List of current questions added */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {questions.map((q, index) => (
                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                        {index + 1}. {q.text} <span style={{ color: 'var(--text-muted)' }}>({q.type.toUpperCase()} • {q.points || 1} pts)</span>
                      </span>
                      <button 
                        type="button" 
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
                        onClick={() => handleRemoveQuestion(q.id)}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
                      No questions written yet. Write below to add.
                    </p>
                  )}
                  {errors.questions && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', textAlign: 'center' }}>{errors.questions}</span>}
                </div>

                {/* Question Creation form inputs */}
                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group" style={{ flexGrow: 1, marginBottom: 0 }}>
                      <label className="form-label">Question Text</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Write the question prompt..." 
                        value={qText}
                        onChange={e => setQText(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ width: '120px', marginBottom: 0 }}>
                      <label className="form-label">Type</label>
                      <select 
                        className="form-select" 
                        value={qType} 
                        onChange={e => {
                          setQType(e.target.value);
                          setCorrectAnswer('0');
                        }}
                      >
                        <option value="mcq">MCQ</option>
                        <option value="tf">True / False</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ width: '110px', marginBottom: 0 }}>
                      <label className="form-label">Marks/Points</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="1" 
                        max="100"
                        value={qPoints}
                        onChange={e => setQPoints(e.target.value)}
                      />
                    </div>
                  </div>

                  {qType === 'mcq' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      <label className="form-label">Answer Options & Correct Match</label>
                      {options.map((opt, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{String.fromCharCode(65 + idx)})</span>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`} 
                            value={opt}
                            onChange={e => {
                              const newOpts = [...options];
                              newOpts[idx] = e.target.value;
                              setOptions(newOpts);
                            }}
                          />
                          <input 
                            type="radio" 
                            name="correct_answer" 
                            checked={correctAnswer === idx.toString()}
                            onChange={() => setCorrectAnswer(idx.toString())}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Correct Answer</label>
                      <select className="form-select" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)}>
                        <option value="0">True</option>
                        <option value="1">False</option>
                      </select>
                    </div>
                  )}

                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={{ width: '100%', color: 'black' }}
                    onClick={handleAddQuestion}
                  >
                    Add Question to Quiz List
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
