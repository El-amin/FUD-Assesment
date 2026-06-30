import React, { useState } from 'react';
import { PlusCircle, Video, ExternalLink, Trash, Calendar, Clock } from 'lucide-react';

export default function VirtualClassManager({
  currentRole,
  users,
  courses,
  virtualClasses,
  onAddVirtualClass,
  onDeleteVirtualClass
}) {
  const user = users.find(u => u.id === currentRole) || users[0];
  const isLecturer = user.role === 'lecturer';

  // Form states (Lecturer)
  const [title, setTitle] = useState('');
  const [meetUrl, setMeetUrl] = useState('');
  const [classDate, setClassDate] = useState('');
  const [classTime, setClassTime] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');

  // Filter states
  const [courseFilter, setCourseFilter] = useState('');

  const handleCreateClassSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !meetUrl.trim() || !classDate || !classTime) {
      alert('Please fill out all fields to schedule a virtual class.');
      return;
    }

    if (!meetUrl.startsWith('http://') && !meetUrl.startsWith('https://')) {
      alert('Please enter a valid Google Meet or meeting URL.');
      return;
    }

    const newClass = {
      id: 'meet_' + Date.now().toString(),
      course_id: selectedCourseId,
      courseId: selectedCourseId,
      title: title.trim(),
      meet_url: meetUrl.trim(),
      meetUrl: meetUrl.trim(),
      class_date: classDate,
      classDate: classDate,
      class_time: classTime,
      classTime: classTime,
      created_at: new Date().toISOString()
    };

    onAddVirtualClass(newClass);

    // Reset Form
    setTitle('');
    setMeetUrl('');
    setClassDate('');
    setClassTime('');
  };

  // Filter scheduled classes
  const filteredClasses = virtualClasses.filter(c => {
    const studentEnrolledCourses = courses;
    const isEnrolled = studentEnrolledCourses.some(course => course.id === c.course_id || course.id === c.courseId);
    if (!isEnrolled) return false;

    return courseFilter ? (c.course_id === courseFilter || c.courseId === courseFilter) : true;
  }).sort((a, b) => {
    const dateTimeA = new Date(`${a.class_date || a.classDate}T${a.class_time || a.classTime}`);
    const dateTimeB = new Date(`${b.class_date || b.classDate}T${b.class_time || b.classTime}`);
    return dateTimeA - dateTimeB; // Sort ascending (closest date first)
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Introduction Banner */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(10, 92, 54, 0.03) 0%, rgba(223, 177, 25, 0.03) 100%)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '10px', borderRadius: 'var(--radius-md)' }}>
            <Video size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-title)', marginBottom: '6px' }}>
              Virtual Google Meet Classroom
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {isLecturer 
                ? 'Create live video classes, paste meeting links, and schedule review sessions for your student group circles.' 
                : 'View scheduled video classes and click to join your lecturer’s Google Meet room.'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isLecturer ? '1fr 2fr' : '1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Schedule Form (Lecturer Only) */}
        {isLecturer && (
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--primary)' }}>
              <PlusCircle size={20} />
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Schedule Meeting</h3>
            </div>

            <form onSubmit={handleCreateClassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Course Association</label>
                <select 
                  className="form-select"
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  required
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Class Session Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Software Requirement Specifications Review"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Google Meet Link</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={meetUrl}
                  onChange={e => setMeetUrl(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={classDate}
                    onChange={e => setClassDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={classTime}
                    onChange={e => setClassTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Schedule Virtual Class
              </button>
            </form>
          </div>
        )}

        {/* RIGHT COLUMN: Virtual Classes List */}
        <div className="card" style={{ padding: '24px' }}>
          
          {/* Header & Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video size={18} style={{ color: 'var(--secondary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                Scheduled Video Lectures ({filteredClasses.length})
              </h3>
            </div>

            <select 
              className="form-select form-input-sm" 
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              style={{ width: '160px', height: '36px', fontSize: '0.8rem' }}
            >
              <option value="">All Course Schedules</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.code}</option>
              ))}
            </select>
          </div>

          {/* List display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredClasses.map(c => {
              const course = courses.find(courseObj => courseObj.id === c.course_id || courseObj.id === c.courseId);
              const classDateTimeStr = `${c.class_date || c.classDate} at ${c.class_time || c.classTime}`;
              
              return (
                <div key={c.id} style={{
                  padding: '16px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{
                      backgroundColor: 'rgba(10, 92, 54, 0.08)',
                      color: 'var(--primary)',
                      padding: '10px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Video size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{course ? course.code : 'General'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {c.class_date || c.classDate}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {c.class_time || c.classTime}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: 'var(--text-title)' }}>
                        {c.title}
                      </h4>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <a 
                      href={c.meet_url || c.meetUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '36px' }}
                    >
                      <ExternalLink size={14} />
                      {isLecturer ? 'Start Class' : 'Join Class'}
                    </a>

                    {isLecturer && (
                      <button 
                        type="button"
                        onClick={() => {
                          if (confirm(`Cancel virtual class "${c.title}"?`)) {
                            onDeleteVirtualClass(c.id);
                          }
                        }}
                        style={{
                          height: '36px',
                          width: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(220, 38, 38, 0.08)',
                          color: 'var(--color-danger)',
                          border: '1px solid rgba(220, 38, 38, 0.15)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                        title="Cancel Class"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredClasses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                No virtual classes scheduled for the selected filter queries.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
