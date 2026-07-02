import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  UserCheck, 
  Trash2, 
  PlusCircle, 
  LogOut, 
  Activity, 
  Search,
  Sparkles,
  Layers,
  GraduationCap,
  Menu
} from 'lucide-react';

export default function AdminDashboard({ 
  courses, 
  users, 
  onAddCourse, 
  onDeleteCourse, 
  onAddUser, 
  onDeleteUser,
  onSignOut 
}) {
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'lecturers', 'students'
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 10;

  // Course Form State
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseSemester, setCourseSemester] = useState('First Semester');
  const [courseDept, setCourseDept] = useState('Computer Science');

  // User Form State (Lecturer & Student)
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Filtering lists based on search
  const filteredCourses = courses.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lecturers = users.filter(u => u.role === 'lecturer');
  const filteredLecturers = lecturers.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const students = users.filter(u => u.role === 'student');
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate Initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Form Submissions
  const handleCreateCourse = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!courseCode.trim() || !courseName.trim()) {
      setFormError('Please enter both course code and course name.');
      return;
    }

    const cleanCode = courseCode.trim().toUpperCase();
    const id = cleanCode.toLowerCase().replace(/\s+/g, '_');

    if (courses.some(c => c.id === id || c.code === cleanCode)) {
      setFormError('A course with this code already exists.');
      return;
    }

    onAddCourse({
      id,
      code: cleanCode,
      name: courseName.trim(),
      semester: courseSemester,
      department: courseDept.trim()
    });

    setCourseCode('');
    setCourseName('');
    setFormSuccess(`Course "${cleanCode}" successfully registered!`);
  };

  const handleCreateUser = (e, role) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!userName.trim() || !userEmail.trim()) {
      setFormError(`Please enter name and ${role === 'lecturer' ? 'academic email' : 'registration number'}.`);
      return;
    }

    if (role === 'lecturer') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(userEmail.trim())) {
        setFormError('Please enter a valid academic email address.');
        return;
      }
    } else {
      if (userEmail.trim().length < 3) {
        setFormError('Please enter a valid registration number.');
        return;
      }
    }

    if (users.some(u => u.email.toLowerCase() === userEmail.trim().toLowerCase())) {
      setFormError(`This ${role === 'lecturer' ? 'email' : 'registration number'} is already registered to another user.`);
      return;
    }

    const cleanName = userName.trim();
    const cleanEmail = userEmail.trim().toLowerCase();
    
    // Generate a simple unique ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `${role}_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${randomSuffix}`;

    const finalPassword = userPassword.trim() || 'password123';

    onAddUser({
      id,
      name: cleanName,
      email: cleanEmail,
      role: role,
      avatar: getInitials(cleanName),
      password: finalPassword,
      is_first_login: true
    });

    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setFormSuccess(`Successfully registered ${role === 'lecturer' ? 'lecturer' : 'student'} "${cleanName}"!`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Sidebar Overlay (Mobile backdrop) */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="portal-brand">
          <div className="portal-logo" style={{ backgroundColor: 'var(--secondary)', color: 'black' }}>A</div>
          <div className="portal-brand-text">
            <span className="portal-name">FUD Admin</span>
            <span className="portal-subtitle">System Portal</span>
          </div>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-links">
            <li>
              <a 
                className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => { setActiveTab('courses'); setSearchQuery(''); setStudentPage(1); setFormError(''); setFormSuccess(''); setSidebarOpen(false); }}
              >
                <BookOpen className="nav-icon" />
                Manage Courses
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${activeTab === 'lecturers' ? 'active' : ''}`}
                onClick={() => { setActiveTab('lecturers'); setSearchQuery(''); setStudentPage(1); setFormError(''); setFormSuccess(''); setSidebarOpen(false); }}
              >
                <GraduationCap className="nav-icon" />
                Manage Lecturers
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => { setActiveTab('students'); setSearchQuery(''); setStudentPage(1); setFormError(''); setFormSuccess(''); setSidebarOpen(false); }}
              >
                <Users className="nav-icon" />
                Manage Students
              </a>
            </li>
          </ul>
        </nav>

        {/* User logout section */}
        <div className="user-panel">
          <div className="user-panel-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="user-avatar" style={{ backgroundColor: 'var(--secondary)', color: 'black' }}>
                AD
              </div>
              <div className="user-details">
                <span className="user-name">FUD Admin</span>
                <span className="user-role" style={{ color: 'var(--secondary)' }}>Portal Authority</span>
              </div>
            </div>
            <button 
              onClick={onSignOut}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-on-sidebar)',
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Sign Out of Admin Portal"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="main-wrapper" style={{ flexGrow: 1, padding: 'var(--workspace-padding, 30px)' }}>
        <header className="top-header" style={{ marginBottom: 'var(--workspace-padding, 30px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="sidebar-toggle" 
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle Menu"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="page-title" style={{ textTransform: 'capitalize' }}>
                {activeTab} Panel
              </h1>
              <p className="page-subtitle-desc" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Add, remove, or audit Federal University Dutse academic resources
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(22, 163, 74, 0.12)',
              color: 'var(--primary)',
              border: '1px solid rgba(22, 163, 74, 0.2)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
              <span>PostgreSQL Connected</span>
            </div>
          </div>
        </header>

        {/* Global form feedback */}
        {formError && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            border: '1px solid rgba(220, 38, 38, 0.15)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            ⚠️ {formError}
          </div>
        )}
        {formSuccess && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(22, 163, 74, 0.08)',
            border: '1px solid rgba(22, 163, 74, 0.15)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            ✓ {formSuccess}
          </div>
        )}

        {/* Grid layout splitting forms and tables */}
        <div className="admin-grid">
          
          {/* LEFT: Add Form Panel */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--primary)' }}>
              <PlusCircle size={20} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>
                Register New {activeTab === 'courses' ? 'Course' : activeTab === 'lecturers' ? 'Lecturer' : 'Student'}
              </h2>
            </div>

            {activeTab === 'courses' && (
              <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Course Code</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. COSC 309"
                    value={courseCode}
                    onChange={e => setCourseCode(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Advanced Software Engineering"
                    value={courseName}
                    onChange={e => setCourseName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select 
                    className="form-input"
                    value={courseSemester}
                    onChange={e => setCourseSemester(e.target.value)}
                  >
                    <option value="First Semester">First Semester</option>
                    <option value="Second Semester">Second Semester</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Department</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Computer Science"
                    value={courseDept}
                    onChange={e => setCourseDept(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Create Course
                </button>
              </form>
            )}

            {(activeTab === 'lecturers' || activeTab === 'students') && (
              <form 
                onSubmit={e => handleCreateUser(e, activeTab === 'lecturers' ? 'lecturer' : 'student')} 
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder={activeTab === 'lecturers' ? 'e.g. Dr. Aisha Musa' : 'e.g. Haruna Usman'}
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {activeTab === 'lecturers' ? 'Academic Email' : 'Registration Number'}
                  </label>
                  <input 
                    type={activeTab === 'lecturers' ? 'email' : 'text'} 
                    className="form-input" 
                    placeholder={activeTab === 'lecturers' ? 'staff@fud.edu.ng' : 'e.g. FUD/CSC/22/1001'}
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Password (Optional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Defaults to password123"
                    value={userPassword}
                    onChange={e => setUserPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Register {activeTab === 'lecturers' ? 'Lecturer' : 'Student'}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT: List Audit Panel */}
          <div className="card" style={{ padding: '24px' }}>
            {/* Search and Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: 'var(--secondary)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                  Active Directory Records ({
                    activeTab === 'courses' ? courses.length : activeTab === 'lecturers' ? lecturers.length : students.length
                  })
                </h3>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input form-input-sm" 
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setStudentPage(1); }}
                  style={{ paddingLeft: '32px', height: '36px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            {/* List Content */}
            <div style={{ overflowX: 'auto' }}>
              {activeTab === 'courses' ? (
                filteredCourses.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No courses found.</div>
                ) : (
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Code</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Title</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Department</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Semester</th>
                        <th style={{ textAlign: 'center', padding: '12px', width: '80px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.code}</td>
                          <td style={{ padding: '12px' }}>{c.name}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.department}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.semester}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button 
                              onClick={() => {
                                if(confirm(`Delete ${c.code}? This will cascade and delete all quizzes, assignments, and groups linked to it.`)) {
                                  onDeleteCourse(c.id);
                                  setFormSuccess(`Course "${c.code}" deleted.`);
                                }
                              }}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
                              title="Delete Course"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : activeTab === 'lecturers' ? (
                filteredLecturers.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No lecturers found.</div>
                ) : (
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Avatar</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Email Address</th>
                        <th style={{ textAlign: 'center', padding: '12px', width: '80px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLecturers.map(l => (
                        <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px' }}>
                            <div className="user-avatar" style={{ margin: 0, width: '32px', height: '32px', fontSize: '0.8rem' }}>{l.avatar}</div>
                          </td>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{l.name}</td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{l.email}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {l.id === 'lecturer_bello' ? (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Seed User</span>
                            ) : (
                              <button 
                                onClick={() => {
                                  if(confirm(`Delete lecturer ${l.name}?`)) {
                                    onDeleteUser(l.id);
                                    setFormSuccess(`Lecturer "${l.name}" deleted.`);
                                  }
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
                                title="Delete Lecturer"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                filteredStudents.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No students found.</div>
                ) : (() => {
                  const totalStudentPages = Math.ceil(filteredStudents.length / studentsPerPage);
                  const startIndex = (studentPage - 1) * studentsPerPage;
                  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

                  return (
                    <>
                      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '12px' }}>Avatar</th>
                            <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                            <th style={{ textAlign: 'left', padding: '12px' }}>Registration Number</th>
                            <th style={{ textAlign: 'center', padding: '12px', width: '80px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedStudents.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '12px' }}>
                                <div className="user-avatar" style={{ margin: 0, width: '32px', height: '32px', fontSize: '0.8rem' }}>{s.avatar}</div>
                              </td>
                              <td style={{ padding: '12px', fontWeight: 'bold' }}>{s.name}</td>
                              <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{s.email}</td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                {['student_aliyu', 'student_fatima', 'student_chidi'].includes(s.id) ? (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Seed User</span>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      if(confirm(`Delete student ${s.name}?`)) {
                                        onDeleteUser(s.id);
                                        setFormSuccess(`Student "${s.name}" deleted.`);
                                      }
                                    }}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
                                    title="Delete Student"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {totalStudentPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', gap: '10px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Showing {startIndex + 1} to {Math.min(startIndex + studentsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              disabled={studentPage === 1}
                              onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              Previous
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold', padding: '0 8px' }}>
                              Page {studentPage} of {totalStudentPages}
                            </span>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              disabled={studentPage === totalStudentPages}
                              onClick={() => setStudentPage(p => Math.min(totalStudentPages, p + 1))}
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
