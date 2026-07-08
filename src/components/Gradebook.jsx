import React, { useState, useEffect } from 'react';
import { Award, BookOpen, FileText, CheckCircle, TrendingUp, Download } from 'lucide-react';

export default function Gradebook({ 
  currentRole, 
  users, 
  courses, 
  quizzes, 
  assignments, 
  submissions,
  initialCourseId,
  enrollments = []
}) {
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || courses[0]?.id || '');
  const user = users.find(u => u.id === currentRole) || users[0];
  const isLecturer = user.role === 'lecturer';

  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  // --- STUDENT GRADEBOOK LOGIC ---
  const renderStudentGradebook = () => {
    const studentId = user.id;
    const studentGroup = user.groupId;

    // Compile all tasks (quizzes & assignments) associated with selected course
    const courseQuizzes = quizzes.filter(q => q.courseId === selectedCourseId);
    const courseAssignments = assignments.filter(a => a.courseId === selectedCourseId);

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
        sub = submissions.find(s => s.taskId === assign.id && s.isGroupSubmission && s.groupId === studentGroup);
      } else {
        sub = submissions.find(s => s.taskId === assign.id && s.studentId === studentId && s.type === 'assignment');
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
              <span className="stat-value">{gradeLetter}</span>
              <span className="stat-label">Estimated Grade Letter</span>
            </div>
            <div className="stat-icon-wrapper secondary"><Award size={20} /></div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="card">
          <h3 className="card-title">
            <BookOpen size={20} style={{ color: 'var(--primary)' }} />
            Academic Assessment Breakdown
          </h3>

          <div className="grade-table-container">
            <table className="grade-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Assessment Type</th>
                  <th>Obtained Marks (Actual)</th>
                  <th>Percentage Equivalent</th>
                  <th>Status</th>
                  <th>Feedback Comments</th>
                </tr>
              </thead>
              <tbody>
                {gradesList.map(item => {
                  const percentVal = typeof item.score === 'number' ? Math.round((item.score / item.maxScore) * 100) : null;
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '700' }}>{item.title}</td>
                      <td>
                        <span className="badge badge-gray">{item.type}</span>
                      </td>
                      <td style={{ fontWeight: '700' }}>
                        {typeof item.score === 'number' ? `${item.score} / ${item.maxScore}` : (item.score || '-')}
                      </td>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                        {percentVal !== null ? `${percentVal}%` : '-'}
                      </td>
                      <td>
                        <span className={`badge ${
                          item.status === 'Graded' ? 'badge-success' : 
                          item.status.startsWith('Submitted') ? 'badge-warning' : 'badge-gray'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', fontStyle: 'italic', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.feedback}
                      </td>
                    </tr>
                  );
                })}

                {gradesList.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
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

    if (students.length === 0) {
      const activeCourse = courses.find(c => c.id === selectedCourseId);
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
          </div>

          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.7 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-title)', marginBottom: '8px' }}>
              No Enrolled Students: {activeCourse ? activeCourse.code : ''}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
              There are currently no students enrolled in this course. At least one student must enroll in this course before you can view the gradebook roster.
            </p>
          </div>
        </div>
      );
    }

    // List all quizzes and assignments in selected course
    const courseQuizzes = quizzes.filter(q => q.courseId === selectedCourseId);
    const courseAssignments = assignments.filter(a => a.courseId === selectedCourseId);
    const totalTasks = [...courseQuizzes, ...courseAssignments];

    // Build the grid roster
    const studentGradesMap = students.map(student => {
      const studentId = student.id;
      const studentGroupId = student.groupId;

      const tasksMap = {};
      let totalObtained = 0;
      let totalMax = 0;
      let gradedTasksCount = 0;

      totalTasks.forEach(task => {
        let sub;
        if (task.id.startsWith('quiz_')) {
          sub = submissions.find(s => s.taskId === task.id && s.studentId === studentId && s.type === 'quiz');
        } else {
          // Assignment
          const isGroupAssign = assignments.find(a => a.id === task.id)?.isGroup;
          if (isGroupAssign) {
            sub = submissions.find(s => s.taskId === task.id && s.isGroupSubmission && s.groupId === studentGroupId);
          } else {
            sub = submissions.find(s => s.taskId === task.id && s.studentId === studentId && s.type === 'assignment');
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
      const csvRows = studentGradesMap.map(row => {
        const studentObj = users.find(u => u.id === row.id);
        const taskScores = totalTasks.map(task => {
          const grade = row.tasks[task.id];
          if (grade && grade.graded) {
            return `${grade.score}`; // Show actual assignment/quiz score (e.g. 95)
          }
          if (grade && grade.status === 'Submitted') {
            return 'Submitted (Pending)';
          }
          return 'N/A';
        });

        return [
          row.name,
          studentObj?.email || '',
          ...taskScores,
          row.gradedTasksCount > 0 ? `${row.totalObtained}` : 'N/A'
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
          </div>
        </div>

        {/* Master Grade Sheet Card */}
        <div className="card">
          <h3 className="card-title">
            <BookOpen size={20} style={{ color: 'var(--primary)' }} />
            Roster Sheet: {courses.find(c => c.id === selectedCourseId)?.name}
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
                        ({task.id.startsWith('quiz_') ? 'Quiz' : `Assign / ${task.maxScore}`})
                      </div>
                    </th>
                  ))}
                  <th style={{ textAlign: 'center' }}>Total Score</th>
                </tr>
              </thead>
              <tbody>
                {studentGradesMap.map(row => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: '600' }}>{row.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{row.regNo}</td>
                    {totalTasks.map(task => {
                      const grade = row.tasks[task.id];
                      if (!grade) return <td key={task.id} style={{ textAlign: 'center' }}>-</td>;
                      
                      if (grade.graded) {
                        return (
                          <td key={task.id} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            <span style={{ color: 'var(--primary)' }}>{grade.score}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}> / {grade.maxScore}</span>
                          </td>
                        );
                      } else if (grade.status === 'Submitted') {
                        return (
                          <td key={task.id} style={{ textAlign: 'center' }}>
                            <span className="badge badge-warning" style={{ fontSize: '0.6rem', padding: '2px 4px' }}>Submit</span>
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
                      {row.gradedTasksCount > 0 ? (
                        <span style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: '800' }}>
                          {row.totalObtained}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}

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
      </div>
    );
  };

  return isLecturer ? renderLecturerGradebook() : renderStudentGradebook();
}
