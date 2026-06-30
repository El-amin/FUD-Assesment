import React from 'react';
import { 
  BookOpen, 
  Award, 
  Users, 
  CheckCircle, 
  Calendar, 
  ArrowRight, 
  Clock, 
  PlusCircle, 
  AlertCircle
} from 'lucide-react';

export default function Dashboard({ 
  currentRole, 
  users, 
  courses, 
  quizzes, 
  assignments, 
  submissions, 
  setCurrentTab,
  setSelectedCourseId
}) {
  const user = users.find(u => u.id === currentRole) || users[0];
  const isLecturer = user.role === 'lecturer';

  // Filter courses for Lecturers: only show courses they offer
  const displayCourses = isLecturer 
    ? courses.filter(c => c.lecturerId === user.id || c.lecturer_id === user.id)
    : courses;

  // Calculate statistics
  const lecturerStats = () => {
    const totalCourses = displayCourses.length;
    const activeQuizzesCount = quizzes.length;
    
    // Count pending grades (submissions with score === null or undefined)
    const pendingGradingCount = submissions.filter(sub => sub.score === undefined || sub.score === null).length;
    
    // Compute average score across all graded submissions
    const gradedSubmissions = submissions.filter(sub => sub.score !== undefined && sub.score !== null);
    const avgScore = gradedSubmissions.length > 0
      ? Math.round(gradedSubmissions.reduce((sum, sub) => sum + sub.score, 0) / gradedSubmissions.length)
      : 85; // fallback default representation

    return [
      { label: 'Active Courses', value: totalCourses, icon: BookOpen, type: 'primary' },
      { label: 'Published Quizzes', value: activeQuizzesCount, icon: Award, type: 'secondary' },
      { label: 'Pending Grading', value: pendingGradingCount, icon: Clock, type: 'info' },
      { label: 'Average Grade', value: `${avgScore}%`, icon: CheckCircle, type: 'primary' }
    ];
  };

  const studentStats = (studentId) => {
    // Enrolled courses (all default courses for simplicity)
    const totalCourses = displayCourses.length;
    
    // Quizzes completed by this student
    const completedQuizzesCount = submissions.filter(sub => sub.studentId === studentId && sub.type === 'quiz').length;
    
    // Assignments submitted by this student (including group submissions they belong to)
    const studentGroup = user.groupId;
    const submittedAssignmentsCount = submissions.filter(sub => {
      if (sub.type !== 'assignment') return false;
      if (sub.isGroupSubmission) {
        return sub.groupId === studentGroup;
      }
      return sub.studentId === studentId;
    }).length;

    // Calculate GPA/Progress based on scores
    const studentGrades = submissions.filter(sub => {
      const isMatch = sub.studentId === studentId || (sub.isGroupSubmission && sub.groupId === studentGroup);
      return isMatch && sub.score !== undefined && sub.score !== null;
    });

    const averageGrade = studentGrades.length > 0
      ? Math.round(studentGrades.reduce((sum, sub) => {
          const maxScore = sub.maxScore || 100;
          return sum + (sub.score / maxScore) * 100;
        }, 0) / studentGrades.length)
      : 0;

    // Convert average grade to GPA
    let gpa = 'N/A';
    if (studentGrades.length > 0) {
      if (averageGrade >= 85) gpa = '4.0';
      else if (averageGrade >= 70) gpa = '3.5';
      else if (averageGrade >= 60) gpa = '3.0';
      else if (averageGrade >= 50) gpa = '2.5';
      else gpa = '2.0';
    }

    return [
      { label: 'Enrolled Courses', value: totalCourses, icon: BookOpen, type: 'primary' },
      { label: 'Quizzes Taken', value: completedQuizzesCount, icon: Award, type: 'secondary' },
      { label: 'Submitted Tasks', value: submittedAssignmentsCount, icon: CheckCircle, type: 'info' },
      { label: 'Estimated GPA', value: gpa === 'N/A' ? 'N/A' : `${gpa} / 4.0`, icon: Award, type: 'primary' }
    ];
  };

  const stats = isLecturer ? lecturerStats() : studentStats(user.id);

  // Get student's group mates
  const getGroupMates = () => {
    if (isLecturer || !user.groupId) return [];
    return users.filter(u => u.groupId === user.groupId && u.id !== user.id);
  };

  const groupMates = getGroupMates();

  // Find upcoming items
  const getUpcomingDeadlines = () => {
    // Returns active assignments/quizzes that are not yet submitted/completed
    if (isLecturer) return [];
    
    const submittedIds = submissions
      .filter(sub => sub.studentId === user.id || (sub.isGroupSubmission && sub.groupId === user.groupId))
      .map(sub => sub.taskId);

    const upcomingQuizzes = quizzes
      .filter(q => !submittedIds.includes(q.id))
      .map(q => ({ ...q, itemType: 'Quiz', icon: Award, tab: 'quizzes' }));

    const upcomingAssignments = assignments
      .filter(a => !submittedIds.includes(a.id))
      .map(a => ({ ...a, itemType: 'Assignment', icon: Calendar, tab: 'assignments' }));

    return [...upcomingQuizzes, ...upcomingAssignments].slice(0, 3);
  };

  const upcomingDeadlines = getUpcomingDeadlines();

  // Recent activity log generator
  const getRecentActivity = () => {
    if (isLecturer) {
      // Show latest submissions
      return submissions.slice(-4).reverse().map(sub => {
        const student = users.find(u => u.id === sub.studentId);
        const task = sub.type === 'quiz' 
          ? quizzes.find(q => q.id === sub.taskId) 
          : assignments.find(a => a.id === sub.taskId);
        
        return {
          id: sub.id,
          text: `${student ? student.name : 'A student'} submitted ${sub.type === 'quiz' ? 'quiz' : 'assignment'} "${task ? task.title : 'Task'}"`,
          time: 'Just now',
          score: sub.score !== undefined && sub.score !== null ? `Graded: ${sub.score}/${sub.maxScore}` : 'Pending Grade',
          type: sub.type
        };
      });
    } else {
      // Show latest grades/feedback
      return submissions
        .filter(sub => {
          const isMatch = sub.studentId === user.id || (sub.isGroupSubmission && sub.groupId === user.groupId);
          return isMatch && sub.score !== undefined && sub.score !== null;
        })
        .slice(-4)
        .reverse()
        .map(sub => {
          const task = sub.type === 'quiz' 
            ? quizzes.find(q => q.id === sub.taskId) 
            : assignments.find(a => a.id === sub.taskId);
          
          return {
            id: sub.id,
            text: `Your ${sub.type} "${task ? task.title : 'Task'}" has been graded`,
            time: 'Recently',
            score: `Grade: ${sub.score}/${sub.maxScore}`,
            type: sub.type
          };
        });
    }
  };

  const activities = getRecentActivity();

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, #064025 100%)', 
        color: '#ffffff', 
        marginBottom: '24px',
        padding: '30px'
      }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '8px' }}>
          Welcome back, {user.name}!
        </h2>
        <p style={{ opacity: 0.85, fontSize: '0.95rem', maxWidth: '600px' }}>
          {isLecturer 
            ? 'Manage your academic courses, create quizzes, coordinate collaborative assignments, and grade submissions on the FUD Assessment System.' 
            : 'Access lectures, participate in student discussion groups, complete active quizzes, submit group tasks, and monitor your academic performance.'}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="stats-row">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card stat-card">
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
              <div className={`stat-icon-wrapper ${stat.type}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Side: Courses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 className="card-title">
              <BookOpen size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
              My Registered Courses
            </h3>
            <div className="item-list" style={{ marginTop: '16px' }}>
              {displayCourses.map(course => (
                <div key={course.id} className="list-item">
                  <div>
                    <span className="list-item-title">{course.code}: {course.name}</span>
                    <p className="list-item-desc">Semester: {course.semester} | Department: {course.department}</p>
                  </div>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setCurrentTab(isLecturer ? 'quizzes' : 'quizzes'); // Go to course content
                    }}
                  >
                    Enter Course
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Group Panel (Student Only) */}
          {!isLecturer && user.groupId && (
            <div className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
              <h3 className="card-title">
                <Users size={20} style={{ color: 'var(--secondary)' }} />
                My Group Assignment Circle
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '1.05rem' }}>{user.groupName}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Collaboration circle for group assignments and quizzes
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Team:</span>
                  <div className="group-mate-stack">
                    <span className="group-mate-avatar" title={user.name}>{user.name.charAt(0)}</span>
                    {groupMates.map(mate => (
                      <span 
                        key={mate.id} 
                        className="group-mate-avatar" 
                        title={mate.name}
                        style={{ backgroundColor: '#0a5c36', color: 'white' }}
                      >
                        {mate.name.charAt(0)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Sidebar Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Actions (Lecturer) or Upcoming Deadlines (Student) */}
          {isLecturer ? (
            <div className="card">
              <h3 className="card-title">
                <PlusCircle size={20} style={{ color: 'var(--primary)' }} />
                Lecturer Shortcuts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => setCurrentTab('quizzes')}
                >
                  <PlusCircle size={18} />
                  Publish New Quiz
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ justifyContent: 'flex-start', color: 'black' }}
                  onClick={() => setCurrentTab('assignments')}
                >
                  <PlusCircle size={18} />
                  Add Assignment Sheet
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <h3 className="card-title">
                <Clock size={20} style={{ color: 'var(--color-warning)' }} />
                Pending Deadlines
              </h3>
              <div className="item-list" style={{ marginTop: '16px' }}>
                {upcomingDeadlines.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                    <CheckCircle size={32} style={{ color: 'var(--color-success)', marginBottom: '8px' }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>Hooray! No pending work.</p>
                  </div>
                ) : (
                  upcomingDeadlines.map(item => (
                    <div key={item.id} className="list-item" style={{ padding: '12px' }}>
                      <div style={{ overflow: 'hidden' }}>
                        <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '2px 6px', marginBottom: '4px' }}>
                          {item.itemType} {item.isGroup && '| Group'}
                        </span>
                        <div className="list-item-title" style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.timeLimit ? `Timer: ${item.timeLimit}m` : `Due: ${item.dueDate}`}
                        </span>
                      </div>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => setCurrentTab(item.tab)}
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        Start
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Activity / Logs Section */}
          <div className="card">
            <h3 className="card-title">
              <AlertCircle size={20} style={{ color: 'var(--color-info)' }} />
              Recent Portal Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              {activities.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', padding: '16px 0' }}>
                  No recent activities recorded.
                </p>
              ) : (
                activities.map(act => (
                  <div key={act.id} style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: act.type === 'quiz' ? 'var(--primary)' : 'var(--secondary)',
                      marginTop: '6px',
                      flexShrink: 0
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '500', color: 'var(--text-title)' }}>{act.text}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {act.score} • {act.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
