import React, { useState } from 'react';
import { 
  BookOpen, 
  PlusCircle, 
  Trash2, 
  Activity, 
  Layers, 
  Clock,
  Briefcase
} from 'lucide-react';

export default function LecturerCourseManager({ 
  currentLecturerId, 
  courses, 
  onAddCourse, 
  onDeleteCourse 
}) {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseSemester, setCourseSemester] = useState('First Semester');
  const [courseDept, setCourseDept] = useState('Computer Science');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Filter courses owned by this lecturer
  const myCourses = courses.filter(c => c.lecturerId === currentLecturerId || c.lecturer_id === currentLecturerId);

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

    // Check globally to avoid duplicates
    if (courses.some(c => c.id === id || c.code === cleanCode)) {
      setFormError('A course with this code already exists in the system.');
      return;
    }

    onAddCourse({
      id,
      code: cleanCode,
      name: courseName.trim(),
      semester: courseSemester,
      department: courseDept.trim(),
      lecturer_id: currentLecturerId,
      lecturerId: currentLecturerId
    });

    setCourseCode('');
    setCourseName('');
    setFormSuccess(`Course "${cleanCode}" successfully registered to your profile!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Intro header banner */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(10, 92, 54, 0.03) 0%, rgba(223, 177, 25, 0.03) 100%)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '10px', borderRadius: 'var(--radius-md)' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-title)', marginBottom: '4px' }}>
              My Offered Courses
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Manage the courses you are currently offering this semester. You can register new courses or delete those you are no longer teaching.
            </p>
          </div>
        </div>
      </div>

      {formError && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(220, 38, 38, 0.08)',
          border: '1px solid rgba(220, 38, 38, 0.15)',
          color: 'var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
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
          fontWeight: '600'
        }}>
          ✓ {formSuccess}
        </div>
      )}

      {/* Grid split form & list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Form to Create Course */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary)' }}>
            <PlusCircle size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Offer a New Course</h3>
          </div>

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
              <label className="form-label">Department</label>
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
              Add Course to Dashboard
            </button>
          </form>
        </div>

        {/* List of offered courses */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={18} style={{ color: 'var(--secondary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>
              Courses You Are Offering ({myCourses.length})
            </h3>
          </div>

          {myCourses.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              You are not offering any courses. Register one using the form on the left.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Code</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Course Title</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Department</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Semester</th>
                    <th style={{ textAlign: 'center', padding: '12px', width: '80px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myCourses.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.code}</td>
                      <td style={{ padding: '12px' }}>{c.name}</td>
                      <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.department}</td>
                      <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.semester}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => {
                            if (confirm(`Delete course ${c.code}? This will cascade and delete all assessments and student groups associated with it.`)) {
                              onDeleteCourse(c.id);
                              setFormSuccess(`Course "${c.code}" has been removed from your offered courses.`);
                            }
                          }}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
                          title="Remove Course"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
