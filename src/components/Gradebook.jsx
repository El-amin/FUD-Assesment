import React, { useState, useEffect } from 'react';
import { Award, BookOpen, FileText, CheckCircle, TrendingUp, Download, X, UserPlus } from 'lucide-react';
function EditableGradeCell({ studentId, task, sub, onGradeSubmission }) {
  const maxScore = task.maxScore || task.max_score || 100;
  const initialValue = sub && sub.score !== undefined && sub.score !== null ? sub.score.toString() : '';
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue(sub && sub.score !== undefined && sub.score !== null ? sub.score.toString() : '');
  }, [sub]);

  const handleSave = async () => {
    if (value === '') {
      setIsEditing(false);
      setValue(initialValue);
      return;
    }

    const newScore = parseInt(value);
    if (isNaN(newScore) || newScore < 0 || newScore > maxScore) {
      alert(`Invalid score. Must be between 0 and ${maxScore}.`);
      setValue(initialValue);
      setIsEditing(false);
      return;
    }

    const currentScore = sub && sub.score !== undefined && sub.score !== null ? sub.score : -1;
    if (newScore === currentScore) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const subId = sub ? sub.id : `sub_paper_virtual_${task.id}_${studentId}`;
      await onGradeSubmission(subId, newScore, sub?.feedback || '', studentId, task.id);
      setIsEditing(false);
    } catch (err) {
      alert('Error updating score: ' + err.message);
      setValue(initialValue);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <td style={{ textAlign: 'center', padding: '4px' }}>
        <input 
          type="number"
          min="0"
          max={maxScore}
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{ 
            width: '65px', 
            height: '28px', 
            textAlign: 'center', 
            fontSize: '0.8rem', 
            margin: 0, 
            padding: '2px',
            border: '1px solid var(--primary)',
            borderRadius: '4px',
            outline: 'none'
          }}
          disabled={isSaving}
        />
      </td>
    );
  }

  const displayScore = sub && sub.score !== undefined && sub.score !== null ? sub.score : '-';
  const hasGrade = sub && sub.score !== undefined && sub.score !== null;

  return (
    <td 
      onClick={() => setIsEditing(true)} 
      style={{ 
        textAlign: 'center', 
        cursor: 'pointer', 
        transition: 'background-color 0.2s',
        position: 'relative'
      }}
      className="editable-grade-cell"
      title="Click to edit score"
    >
      <div style={{ display: 'inline-block', minWidth: '40px', padding: '6px' }}>
        {isSaving ? (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>saving...</span>
        ) : hasGrade ? (
          <>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{displayScore}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}> / {maxScore}</span>
          </>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
        )}
      </div>
    </td>
  );
}


export default function Gradebook({ 
  currentRole, 
  users, 
  courses, 
  quizzes, 
  assignments, 
  submissions,
  initialCourseId,
  enrollments = [],
  groups = [],
  onAddPaperTestResults,
  onGradeSubmission,
  attendanceSessions = [],
  attendanceRecords = [],
  onAddVirtualStudent
}) {
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || courses[0]?.id || '');
  const [gradebookSearch, setGradebookSearch] = useState('');
  const user = users.find(u => u.id === currentRole) || users[0];
  const isLecturer = user.role === 'lecturer';

  // Paper Test Form States
  const [showPaperTestModal, setShowPaperTestModal] = useState(false);
  const [paperTestTitle, setPaperTestTitle] = useState('');
  const [paperTestMaxScore, setPaperTestMaxScore] = useState(30);
  const [paperTestDueDate, setPaperTestDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [studentMarks, setStudentMarks] = useState({});
  const [studentFeedbacks, setStudentFeedbacks] = useState({});
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRegNo, setNewStudentRegNo] = useState('');
  const [regNoSort, setRegNoSort] = useState(null); // 'asc', 'desc', or null

  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  useEffect(() => {
    setRegNoSort(null);
  }, [selectedCourseId]);

  const handleSavePaperTest = (e, studentsList) => {
    e.preventDefault();

    if (!paperTestTitle.trim()) {
      alert("Please enter a title for the paper test.");
      return;
    }

    const maxScoreVal = parseInt(paperTestMaxScore);
    if (isNaN(maxScoreVal) || maxScoreVal <= 0) {
      alert("Please enter a valid maximum score.");
      return;
    }

    const results = [];
    let hasValidationError = false;

    studentsList.forEach(student => {
      const scoreStr = studentMarks[student.id];
      if (scoreStr !== undefined && scoreStr !== '') {
        const scoreNum = parseInt(scoreStr);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScoreVal) {
          alert(`Marks for student ${student.name} must be a number between 0 and ${maxScoreVal}.`);
          hasValidationError = true;
          return;
        }
        results.push({
          studentId: student.id,
          score: scoreNum,
          feedback: studentFeedbacks[student.id] || 'Grade recorded via Gradebook.'
        });
      }
    });

    if (hasValidationError) return;

    if (results.length === 0) {
      if (!confirm("You have not entered scores for any students. Do you still want to create this assessment sheet?")) {
        return;
      }
    }

    const newTest = {
      id: `assign_paper_${Date.now()}`,
      courseId: selectedCourseId,
      title: paperTestTitle.trim(),
      description: `Paper-based Test conducted on ${paperTestDueDate}.`,
      maxScore: maxScoreVal,
      dueDate: paperTestDueDate,
      isGroup: false
    };

    onAddPaperTestResults(newTest, results);

    // Reset fields
    setPaperTestTitle('');
    setPaperTestMaxScore(30);
    setStudentMarks({});
    setStudentFeedbacks({});
    setShowPaperTestModal(false);
  };

  const renderStudentGradebook = () => {
    const studentId = user.id;
    const courseGroup = groups.find(g => g.courseId === selectedCourseId && g.memberIds.includes(studentId));
    const studentGroup = courseGroup ? courseGroup.id : null;

    // Compute attendance percentage for this student in this course
    const courseSessions = attendanceSessions.filter(s => s.courseId === selectedCourseId || s.course_id === selectedCourseId);
    const studentPresentSessions = attendanceRecords.filter(r => {
      const matchStudent = r.studentId === studentId || r.student_id === studentId;
      if (!matchStudent) return false;
      return courseSessions.some(s => s.id === r.sessionId || s.id === r.session_id);
    });
    const attendancePercent = courseSessions.length > 0 
      ? Math.round((studentPresentSessions.length / courseSessions.length) * 100)
      : 100;

    // Compile all tasks (quizzes & assignments) associated with selected course
    const courseQuizzes = quizzes.filter(q => q.courseId === selectedCourseId);
    const courseAssignments = assignments.filter(a => a.courseId === selectedCourseId);
    const totalTasks = [...courseQuizzes, ...courseAssignments];

    const gradesList = [];

    // Evaluate Quizzes (Actual score out of quiz total points)
    courseQuizzes.forEach(quiz => {
      const sub = submissions.find(s => s.taskId === quiz.id && s.studentId === studentId && s.type === 'quiz');
      const isReleased = sub ? (sub.isReleased || sub.is_released) : false;
      const maxPoints = quiz.questions.reduce((sum, q) => sum + (parseInt(q.points) || 1), 0);
      let obtainedScore = sub ? (isReleased ? sub.score : 'Pending Release') : null;
      if (sub && isReleased && typeof sub.score === 'number' && sub.score > maxPoints) {
        // Backwards compatibility for percentage scores
        obtainedScore = Math.round((sub.score / 100) * maxPoints);
      }

      gradesList.push({
        id: quiz.id,
        title: quiz.title,
        type: 'Quiz',
        maxScore: maxPoints,
        score: obtainedScore,
        status: sub ? (isReleased ? 'Graded' : 'Submitted (Awaiting Release)') : 'Not Taken',
        feedback: sub ? (isReleased ? 'Auto-graded upon submission' : 'Score withheld awaiting lecturer review') : 'Pending completion'
      });
    });

    // Evaluate Assignments (Actual score out of assignment max score)
    courseAssignments.forEach(assign => {
      let sub;
      if (assign.isGroup) {
        const matches = submissions.filter(s => s.taskId === assign.id && s.isGroupSubmission && s.groupId === studentGroup);
        sub = matches.find(s => s.score !== undefined && s.score !== null) || matches[matches.length - 1];
      } else {
        const matches = submissions.filter(s => s.taskId === assign.id && s.studentId === studentId && s.type === 'assignment');
        sub = matches.find(s => s.score !== undefined && s.score !== null) || matches[matches.length - 1];
      }

      gradesList.push({
        id: assign.id,
        title: assign.title,
        type: assign.isGroup ? 'Group Assignment' : 'Individual Assignment',
        maxScore: assign.maxScore,
        score: sub ? sub.score : null,
        status: sub ? (sub.score !== undefined && sub.score !== null ? 'Graded' : 'Submitted (Pending)') : 'Not Submitted',
        feedback: sub ? (sub.feedback || 'No comments written.') : 'Pending upload'
      });
    });

    // Compute student total score (sum of points, not average of percentages)
    const gradedItems = gradesList.filter(g => g.score !== null && g.status === 'Graded');
    const completedCount = gradesList.filter(g => g.score !== null || g.status.startsWith('Submitted')).length;
    const totalCount = gradesList.length;

    const totalObtained = gradedItems.reduce((sum, item) => sum + item.score, 0);
    const totalMax = gradedItems.reduce((sum, item) => sum + item.maxScore, 0);
    const coursePercent = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

    let gradeLetter = 'N/A';
    if (gradedItems.length > 0) {
      if (coursePercent >= 80) gradeLetter = 'A (Excellent)';
      else if (coursePercent >= 70) gradeLetter = 'B (Very Good)';
      else if (coursePercent >= 60) gradeLetter = 'C (Credit)';
      else if (coursePercent >= 50) gradeLetter = 'D (Pass)';
      else gradeLetter = 'F (Fail)';
    }

    return (
      <div>
        {/* Header course selection */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Academic Gradebook</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Monitor your continuous assessments, examination marks, and feedback transcripts.
            </p>
          </div>
          <select 
            className="form-select" 
            value={selectedCourseId} 
            onChange={e => setSelectedCourseId(e.target.value)}
            style={{ width: '250px' }}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
            ))}
          </select>
        </div>

        {/* Small stats banner */}
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="card stat-card" style={{ padding: '16px' }}>
            <div className="stat-info">
              <span className="stat-value">{completedCount} / {totalCount}</span>
              <span className="stat-label">Tasks Completed</span>
            </div>
            <div className="stat-icon-wrapper info"><CheckCircle size={20} /></div>
          </div>
          <div className="card stat-card" style={{ padding: '16px' }}>
            <div className="stat-info">
              <span className="stat-value">{totalObtained} / {totalMax}</span>
              <span className="stat-label">Total Score ({coursePercent}%)</span>
            </div>
            <div className="stat-icon-wrapper primary"><TrendingUp size={20} /></div>
          </div>
          <div className="card stat-card" style={{ padding: '16px' }}>
            <div className="stat-info">
              <span className="stat-value">{attendancePercent}%</span>
              <span className="stat-label">Course Attendance</span>
            </div>
            <div className="stat-icon-wrapper secondary"><Award size={20} /></div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="card">
          <h3 className="card-title">
            <BookOpen size={20} style={{ color: 'var(--primary)' }} />
            My Grade Roster Sheet
          </h3>

          <div className="grade-table-container">
            <table className="grade-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Registration Number</th>
                  {totalTasks.map(task => (
                    <th key={task.id} style={{ fontSize: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontWeight: '800' }}>{task.title}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        ({task.id.startsWith('quiz_') ? 'Quiz' : `Assign / ${task.maxScore || task.max_score}`})
                      </div>
                    </th>
                  ))}
                  <th style={{ textAlign: 'center' }}>Total Score</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: '600' }}>{user.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</td>
                  {totalTasks.map(task => {
                    const gradeItem = gradesList.find(g => g.id === task.id);
                    if (!gradeItem) return <td key={task.id} style={{ textAlign: 'center' }}>-</td>;

                    if (gradeItem.status === 'Graded') {
                      return (
                        <td key={task.id} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                          <span style={{ color: 'var(--primary)' }}>{gradeItem.score}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}> / {gradeItem.maxScore}</span>
                        </td>
                      );
                    } else if (gradeItem.status.startsWith('Submitted')) {
                      return (
                        <td key={task.id} style={{ textAlign: 'center' }}>
                          <span className="badge badge-warning" style={{ fontSize: '0.6rem', padding: '2px 4px' }}>Submitted</span>
                        </td>
                      );
                    } else {
                      return (
                        <td key={task.id} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          -
                        </td>
                      );
                    }
                  })}
                  <td style={{ textAlign: 'center', fontWeight: '800', backgroundColor: 'rgba(10, 92, 54, 0.02)' }}>
                    {gradedItems.length > 0 ? (
                      <span style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: '800' }}>
                        {totalObtained}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                </tr>

                {totalTasks.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No tasks found for this course.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- LECTURER ROSTER LOGIC WITH CSV EXPORT ---
  const renderLecturerGradebook = () => {
    if (courses.length === 0) {
      return (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Award size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-title)', marginBottom: '8px' }}>
            No Active Courses Found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
            You must create a course and have at least one student enrolled before you can view a gradebook roster.
          </p>
        </div>
      );
    }

    // List only students enrolled in this course
    const students = users.filter(u => {
      if (u.role !== 'student') return false;
      return enrollments.some(e => 
        e.studentId === u.id && 
        (e.courseId === selectedCourseId || e.course_id === selectedCourseId)
      );
    });

    const enrolledStudentIds = students.map(u => u.id);
    const unenrolledStudents = users.filter(u => 
      u.role === 'student' && !enrolledStudentIds.includes(u.id)
    );

    // List all quizzes and assignments in selected course
    const courseQuizzes = quizzes.filter(q => q.courseId === selectedCourseId);
    const courseAssignments = assignments.filter(a => a.courseId === selectedCourseId);
    const totalTasks = [...courseQuizzes, ...courseAssignments];

    // Build the grid roster
    const studentGradesMap = students.map(student => {
      const studentId = student.id;
      const courseGroup = groups.find(g => g.courseId === selectedCourseId && g.memberIds.includes(studentId));
      const studentGroupId = courseGroup ? courseGroup.id : null;

      const tasksMap = {};
      let totalObtained = 0;
      let totalMax = 0;
      let gradedTasksCount = 0;

      totalTasks.forEach(task => {
        let sub;
        if (task.id.startsWith('quiz_')) {
          sub = submissions.find(s => s.taskId === task.id && s.studentId === studentId && s.type === 'quiz');
        } else {
          // Assignment (resilience to multiple submissions by preferring graded records)
          const isGroupAssign = assignments.find(a => a.id === task.id)?.isGroup;
          if (isGroupAssign) {
            const matches = submissions.filter(s => s.taskId === task.id && s.isGroupSubmission && s.groupId === studentGroupId);
            sub = matches.find(s => s.score !== undefined && s.score !== null) || matches[matches.length - 1];
          } else {
            const matches = submissions.filter(s => s.taskId === task.id && s.studentId === studentId && s.type === 'assignment');
            sub = matches.find(s => s.score !== undefined && s.score !== null) || matches[matches.length - 1];
          }
        }

        if (sub && sub.score !== undefined && sub.score !== null) {
          const maxScore = task.maxScore || 100;
          tasksMap[task.id] = { score: sub.score, maxScore, graded: true };
          totalObtained += sub.score;
          totalMax += maxScore;
          gradedTasksCount++;
        } else if (sub) {
          tasksMap[task.id] = { status: 'Submitted', graded: false };
        } else {
          tasksMap[task.id] = { status: 'Missing', graded: false };
        }
      });

      return {
        id: student.id,
        name: student.name,
        regNo: student.email,
        groupName: student.groupName || 'No Group',
        tasks: tasksMap,
        totalObtained,
        totalMax,
        gradedTasksCount
      };
    });
    // Filter the studentGradesMap based on search query
    const filteredStudentGradesMap = studentGradesMap.filter(row => {
      const q = gradebookSearch.toLowerCase().trim();
      return row.name.toLowerCase().includes(q) || row.regNo.toLowerCase().includes(q);
    });

    if (regNoSort === 'asc') {
      filteredStudentGradesMap.sort((a, b) => (a.regNo || '').localeCompare(b.regNo || '', undefined, { numeric: true, sensitivity: 'base' }));
    } else if (regNoSort === 'desc') {
      filteredStudentGradesMap.sort((a, b) => (b.regNo || '').localeCompare(a.regNo || '', undefined, { numeric: true, sensitivity: 'base' }));
    }
    // CSV Roster Export Trigger (Exporting actual scores)
    const handleExportCSV = () => {
      const course = courses.find(c => c.id === selectedCourseId);
      const courseCode = course?.code || 'Course';

      // Headers: Name, Matric Number (Email), [Quizzes/Assignments...], Total Score
      const headers = [
        'Student Name',
        'Matric Number / Email',
        ...totalTasks.map(t => `${t.title} (${t.id.startsWith('quiz_') ? 'Quiz' : 'Assignment'})`),
        'Total Score Obtained'
      ];

      // Rows
      const csvRows = filteredStudentGradesMap.map(row => {
        const studentObj = users.find(u => u.id === row.id);
        const taskScores = totalTasks.map(task => {
          const grade = row.tasks[task.id];
          if (grade && grade.graded) {
            return `${grade.score}`; // Show actual assignment/quiz score (e.g. 95)
          }
          if (grade && grade.status === 'Submitted') {
            return 'Submitted (Pending)';
          }
          return ''; // Empty value for unrecorded score
        });

        return [
          row.name,
          studentObj?.email || '',
          ...taskScores,
          row.gradedTasksCount > 0 ? `${row.totalObtained}` : '0' // Default to 0 for unrecorded total
        ];
      });

      // Construct content
      const csvContent = [
        headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
        ...csvRows.map(r => r.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Create browser download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${courseCode.replace(/\s+/g, '_')}_Grade_Roster.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div>
        {/* Header course selection */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Gradebook Roster</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Review aggregated academic scores across quizzes and assignments for all registered students.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              className="form-select" 
              value={selectedCourseId} 
              onChange={e => setSelectedCourseId(e.target.value)}
              style={{ width: '220px' }}
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
              ))}
            </select>
            <button 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'black' }}
              onClick={handleExportCSV}
              disabled={students.length === 0}
              title="Download full course grade roster with actual scores as a CSV spreadsheet"
            >
              <Download size={18} />
              Export Roster CSV
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'black' }}
              onClick={() => setShowAddStudentModal(true)}
              title="Add a student directly to the gradebook roster"
            >
              <UserPlus size={18} />
              Add Student Row
            </button>
            <button 
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setShowPaperTestModal(true)}
              disabled={students.length === 0}
            >
              <Award size={18} />
              Record Paper Marks
            </button>
          </div>
        </div>

        {/* Master Grade Sheet Card */}
        <div className="card">
          <h3 className="card-title">
            <BookOpen size={20} style={{ color: 'var(--primary)' }} />
            Roster Sheet: {courses.find(c => c.id === selectedCourseId)?.name}
          </h3>

          {/* Search bar inside Gradebook Roster */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px', padding: '0 4px' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <input 
                type="text" 
                placeholder="Search student or matric number..." 
                value={gradebookSearch}
                onChange={e => setGradebookSearch(e.target.value)}
                className="form-input"
                style={{ height: '36px', fontSize: '0.85rem', paddingLeft: '32px', margin: 0 }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                🔍
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total Students: <strong>{students.length}</strong> | Showing: <strong>{filteredStudentGradesMap.length}</strong>
            </div>
          </div>

          <div className="grade-table-container">
            <table className="grade-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th 
                    onClick={() => {
                      if (regNoSort === null) setRegNoSort('asc');
                      else if (regNoSort === 'asc') setRegNoSort('desc');
                      else setRegNoSort(null);
                    }}
                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                    title="Click to sort by Registration Number (Toggle Ascending / Descending)"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span>Registration Number</span>
                      <span style={{ 
                        fontSize: '0.85rem', 
                        color: regNoSort ? 'var(--primary)' : 'var(--text-muted)',
                        backgroundColor: regNoSort ? 'rgba(10, 92, 54, 0.08)' : 'transparent',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        transition: 'all 0.2s'
                      }}>
                        {regNoSort === 'asc' ? '▲' : regNoSort === 'desc' ? '▼' : '⇅'}
                      </span>
                    </div>
                  </th>
                  {totalTasks.map(task => (
                    <th key={task.id} style={{ fontSize: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontWeight: '800' }}>{task.title}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        ({task.id.startsWith('quiz_') ? 'Quiz' : `Assign / ${task.maxScore}`})
                      </div>
                    </th>
                  ))}
                  <th style={{ textAlign: 'center' }}>Total Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudentGradesMap.map(row => {
                  const studentId = row.id;
                  const courseGroup = groups.find(g => g.courseId === selectedCourseId && g.memberIds.includes(studentId));
                  const studentGroupId = courseGroup ? courseGroup.id : null;

                  return (
                    <tr key={row.id}>
                      <td style={{ fontWeight: '600' }}>{row.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{row.regNo}</td>
                      {totalTasks.map(task => {
                        let sub;
                        if (task.id.startsWith('quiz_')) {
                          sub = submissions.find(s => s.taskId === task.id && s.studentId === studentId && s.type === 'quiz');
                        } else {
                          const isGroupAssign = assignments.find(a => a.id === task.id)?.isGroup || assignments.find(a => a.id === task.id)?.is_group;
                          if (isGroupAssign) {
                            const matches = submissions.filter(s => s.taskId === task.id && (
                              ((s.isGroupSubmission || s.is_group_submission) && studentGroupId && (s.groupId === studentGroupId || s.group_id === studentGroupId)) ||
                              (s.studentId === studentId || s.student_id === studentId)
                            ));
                            sub = matches.find(s => s.score !== undefined && s.score !== null) || matches[matches.length - 1];
                          } else {
                            const matches = submissions.filter(s => s.taskId === task.id && (s.studentId === studentId || s.student_id === studentId));
                            sub = matches.find(s => s.score !== undefined && s.score !== null) || matches[matches.length - 1];
                          }
                        }

                        return (
                          <EditableGradeCell 
                            key={task.id}
                            studentId={studentId}
                            task={task}
                            sub={sub}
                            onGradeSubmission={onGradeSubmission}
                          />
                        );
                      })}
                      <td style={{ textAlign: 'center', fontWeight: '800', backgroundColor: 'rgba(10, 92, 54, 0.02)' }}>
                        {row.gradedTasksCount > 0 ? (
                          <span style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: '800' }}>
                            {row.totalObtained}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {students.length === 0 && (
                  <tr>
                    <td colSpan={totalTasks.length + 3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No students enrolled in this portal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paper Test Scoring Modal */}
        {showPaperTestModal && (
          <div className="modal-overlay" onClick={() => setShowPaperTestModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Award size={22} style={{ color: 'var(--primary)' }} />
                  Record Paper-Based Test Results
                </h3>
                <button 
                  onClick={() => setShowPaperTestModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => handleSavePaperTest(e, students)} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflow: 'hidden' }}>
                <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr 1.2fr', gap: '14px', marginBottom: '4px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Test Title / Topic</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. Mid-Semester CA Test"
                      value={paperTestTitle}
                      onChange={e => setPaperTestTitle(e.target.value)}
                      style={{ height: '36px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Max Score</label>
                    <input 
                      type="number"
                      className="form-input"
                      min="1"
                      value={paperTestMaxScore}
                      onChange={e => setPaperTestMaxScore(parseInt(e.target.value) || 0)}
                      style={{ height: '36px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Date Conducted</label>
                    <input 
                      type="date"
                      className="form-input"
                      value={paperTestDueDate}
                      onChange={e => setPaperTestDueDate(e.target.value)}
                      style={{ height: '36px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flex: 1 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1.2fr 1.8fr', padding: '10px 14px', backgroundColor: 'rgba(10, 92, 54, 0.04)', borderBottom: '1px solid var(--border)', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-title)' }}>
                    <span>Student Name</span>
                    <span>Registration No</span>
                    <span style={{ textAlign: 'center' }}>Score Obtained</span>
                    <span>Remarks / Feedback</span>
                  </div>
                  <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {students.map(student => (
                      <div key={student.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1.2fr 1.8fr', padding: '8px 14px', alignItems: 'center', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        <span style={{ fontWeight: '700' }}>{student.name}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{student.email}</span>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <input 
                            type="number"
                            className="form-input"
                            min="0"
                            max={paperTestMaxScore}
                            placeholder={`Max: ${paperTestMaxScore}`}
                            value={studentMarks[student.id] || ''}
                            onChange={e => setStudentMarks({
                              ...studentMarks,
                              [student.id]: e.target.value
                            })}
                            style={{ width: '90px', height: '32px', textAlign: 'center', fontSize: '0.85rem', margin: 0, padding: '4px' }}
                          />
                        </div>
                        <input 
                          type="text"
                          className="form-input"
                          placeholder="Feedback comments..."
                          value={studentFeedbacks[student.id] || ''}
                          onChange={e => setStudentFeedbacks({
                            ...studentFeedbacks,
                            [student.id]: e.target.value
                          })}
                          style={{ height: '32px', fontSize: '0.8rem', margin: 0, padding: '4px 8px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => setShowPaperTestModal(false)}
                    style={{ padding: '8px 16px', margin: 0 }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ padding: '8px 24px', margin: 0 }}
                  >
                    Publish Test Grades
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddStudentModal && (
          <div className="modal-overlay" onClick={() => setShowAddStudentModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', padding: '24px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <UserPlus size={22} style={{ color: 'var(--primary)' }} />
                  Add Student to Roster
                </h3>
                <button 
                  onClick={() => setShowAddStudentModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                  Enter the student's name and registration number to add them directly as a new row in this course roster sheet.
                </p>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Student Full Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. Farouq Olatunji"
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    style={{ height: '38px', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Registration / Matric Number</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. FCP/CSC/25/1015"
                    value={newStudentRegNo}
                    onChange={e => setNewStudentRegNo(e.target.value)}
                    style={{ height: '38px', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => { setShowAddStudentModal(false); setNewStudentName(''); setNewStudentRegNo(''); }}
                    style={{ padding: '8px 16px', margin: 0 }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={async () => {
                      if (!newStudentName.trim() || !newStudentRegNo.trim()) {
                        alert('Please fill in both fields.');
                        return;
                      }
                      await onAddVirtualStudent(newStudentName.trim(), newStudentRegNo.trim(), selectedCourseId);
                      setShowAddStudentModal(false);
                      setNewStudentName('');
                      setNewStudentRegNo('');
                    }}
                    style={{ padding: '8px 24px', margin: 0 }}
                  >
                    Add Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return isLecturer ? renderLecturerGradebook() : renderStudentGradebook();
}
