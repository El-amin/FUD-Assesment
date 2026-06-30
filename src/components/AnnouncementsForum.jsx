import React, { useState } from 'react';
import { PlusCircle, Megaphone, MessageSquare, Trash, Calendar } from 'lucide-react';

export default function AnnouncementsForum({
  currentRole,
  users,
  courses,
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement
}) {
  const user = users.find(u => u.id === currentRole) || users[0];
  const isLecturer = user.role === 'lecturer';

  // Form states (Lecturer)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');

  // Filter states
  const [courseFilter, setCourseFilter] = useState('');

  const handlePostAnnouncementSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Please fill out both the title and message fields.');
      return;
    }

    const newAnnouncement = {
      id: 'announcement_' + Date.now().toString(),
      course_id: selectedCourseId,
      courseId: selectedCourseId,
      title: title.trim(),
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    onAddAnnouncement(newAnnouncement);

    // Reset Form
    setTitle('');
    setContent('');
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter(a => {
    const studentEnrolledCourses = courses;
    const isEnrolled = studentEnrolledCourses.some(c => c.id === a.course_id || c.id === a.courseId);
    if (!isEnrolled) return false;

    return courseFilter ? (a.course_id === courseFilter || a.courseId === courseFilter) : true;
  }).sort((x, y) => new Date(y.created_at) - new Date(x.created_at));

  // Date formatter helper
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (err) {
      return isoString || 'Just now';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Introduction Banner */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(10, 92, 54, 0.03) 0%, rgba(223, 177, 25, 0.03) 100%)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '10px', borderRadius: 'var(--radius-md)' }}>
            <Megaphone size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-title)', marginBottom: '6px' }}>
              Academic Announcements Forum
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {isLecturer 
                ? 'Send broadcast alerts, updates regarding quizzes/assignments, or schedule changes to students enrolled in your courses.' 
                : 'Read instructions, schedule updates, and syllabus announcements published by your lecturers.'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isLecturer ? '1fr 2fr' : '1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Compose Form (Lecturers Only) */}
        {isLecturer && (
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--primary)' }}>
              <PlusCircle size={20} />
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Compose Announcement</h3>
            </div>

            <form onSubmit={handlePostAnnouncementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Target Course</label>
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
                <label className="form-label">Announcement Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Next Monday Quiz Postponed"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alert Message Content</label>
                <textarea 
                  className="form-input" 
                  rows={5}
                  placeholder="Type details for students..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                  style={{ resize: 'none', padding: '10px' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Publish Announcement
              </button>
            </form>
          </div>
        )}

        {/* RIGHT COLUMN: Announcement Feed & Filter */}
        <div className="card" style={{ padding: '24px' }}>
          
          {/* Header & Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} style={{ color: 'var(--secondary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                Announcements Board Feed ({filteredAnnouncements.length})
              </h3>
            </div>

            <select 
              className="form-select form-input-sm" 
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              style={{ width: '160px', height: '36px', fontSize: '0.8rem' }}
            >
              <option value="">All Course Forums</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.code}</option>
              ))}
            </select>
          </div>

          {/* Feed Thread List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {filteredAnnouncements.map(a => {
              const course = courses.find(c => c.id === a.course_id || c.id === a.courseId);
              return (
                <div key={a.id} className="card" style={{
                  padding: '20px',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border)',
                  position: 'relative'
                }}>
                  
                  {/* Top line metadata */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{course ? course.code : 'General'}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {formatDate(a.created_at)}
                      </span>
                    </div>

                    {isLecturer && (
                      <button 
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete announcement "${a.title}"?`)) {
                            onDeleteAnnouncement(a.id);
                          }
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-danger)',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        title="Delete Announcement"
                      >
                        <Trash size={15} />
                      </button>
                    )}
                  </div>

                  {/* Header Title */}
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-title)', margin: '0 0 8px 0' }}>
                    {a.title}
                  </h4>

                  {/* Content message */}
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    margin: 0,
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {a.content}
                  </p>

                </div>
              );
            })}

            {filteredAnnouncements.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                No active announcements found for your courses.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
