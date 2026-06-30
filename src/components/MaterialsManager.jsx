import React, { useState } from 'react';
import { PlusCircle, FileText, ExternalLink, Trash, BookOpen, Layers } from 'lucide-react';

export default function MaterialsManager({
  currentRole,
  users,
  courses,
  materials,
  onAddMaterial,
  onDeleteMaterial
}) {
  const user = users.find(u => u.id === currentRole) || users[0];
  const isLecturer = user.role === 'lecturer';

  // Form states (Lecturer)
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Slide'); // Slide, Book, Other
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');

  // Filter states (Both)
  const [courseFilter, setCourseFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const handleAddMaterialSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) {
      alert('Please fill out the title and link fields.');
      return;
    }

    // URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('Please enter a valid URL (starting with http:// or https://)');
      return;
    }

    const newMaterial = {
      id: 'material_' + Date.now().toString(),
      course_id: selectedCourseId,
      courseId: selectedCourseId, // camelCase copy just in case
      title: title.trim(),
      type,
      url: url.trim(),
      description: description.trim(),
      created_at: new Date().toISOString()
    };

    onAddMaterial(newMaterial);

    // Reset Form
    setTitle('');
    setUrl('');
    setDescription('');
  };

  // Filtered materials
  const filteredMaterials = materials.filter(m => {
    // If student, only show materials for their enrolled courses
    const studentEnrolledCourses = isLecturer ? courses : courses; // In App.jsx, visibleCourses is already filtered
    const isEnrolled = studentEnrolledCourses.some(c => c.id === m.course_id || c.id === m.courseId);
    if (!isEnrolled) return false;

    const matchesCourse = courseFilter ? (m.course_id === courseFilter || m.courseId === courseFilter) : true;
    const matchesType = typeFilter ? m.type === typeFilter : true;
    return matchesCourse && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Introduction Banner */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(10, 92, 54, 0.03) 0%, rgba(223, 177, 25, 0.03) 100%)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '10px', borderRadius: 'var(--radius-md)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-title)', marginBottom: '6px' }}>
              Lecture Materials & Library Resources
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {isLecturer 
                ? 'Distribute PDF textbooks, Google Slides presentations, syllabus guides, and reference documents directly to your students.' 
                : 'Access reading guides, course syllabus outlines, reference slides, and textbooks assigned to you by your lecturers.'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isLecturer ? '1fr 2fr' : '1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Add Material Form (Lecturers Only) */}
        {isLecturer && (
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--primary)' }}>
              <PlusCircle size={20} />
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Publish New Material</h3>
            </div>

            <form onSubmit={handleAddMaterialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                <label className="form-label">Resource Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Lecture 1: Introduction to OOP"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resource Type</label>
                <select 
                  className="form-select"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="Slide">Lecture Slides</option>
                  <option value="Book">Reference Book / PDF</option>
                  <option value="Other">Syllabus / Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Resource Link (URL)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://drive.google.com/... or https://..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resource Description (Optional)</label>
                <textarea 
                  className="form-input" 
                  rows={3}
                  placeholder="Add details, chapter scopes, or download guidelines..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ resize: 'none', padding: '10px' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Publish Resource
              </button>
            </form>
          </div>
        )}

        {/* RIGHT COLUMN: Library Directory & Filters */}
        <div className="card" style={{ padding: '24px' }}>
          
          {/* Header & Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--secondary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                Resource Library Directory ({filteredMaterials.length})
              </h3>
            </div>

            {/* Filters bar */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select 
                className="form-select form-input-sm" 
                value={courseFilter}
                onChange={e => setCourseFilter(e.target.value)}
                style={{ width: '150px', height: '36px', fontSize: '0.8rem' }}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.code}</option>
                ))}
              </select>

              <select 
                className="form-select form-input-sm" 
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={{ width: '140px', height: '36px', fontSize: '0.8rem' }}
              >
                <option value="">All Types</option>
                <option value="Slide">Lecture Slides</option>
                <option value="Book">Books</option>
                <option value="Other">Others</option>
              </select>
            </div>
          </div>

          {/* Directory Listings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredMaterials.map(m => {
              const course = courses.find(c => c.id === m.course_id || c.id === m.courseId);
              return (
                <div key={m.id} style={{
                  padding: '16px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'transform var(--transition-fast)'
                }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      backgroundColor: m.type === 'Slide' 
                        ? 'rgba(234, 88, 12, 0.1)' 
                        : m.type === 'Book' 
                          ? 'rgba(22, 163, 74, 0.1)' 
                          : 'rgba(100, 116, 139, 0.1)',
                      color: m.type === 'Slide' 
                        ? 'var(--color-warning)' 
                        : m.type === 'Book' 
                          ? 'var(--primary)' 
                          : 'var(--text-muted)',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <FileText size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{course ? course.code : 'General'}</span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          color: m.type === 'Slide' 
                            ? 'var(--color-warning)' 
                            : m.type === 'Book' 
                              ? 'var(--primary)' 
                              : 'var(--text-muted)',
                        }}>
                          {m.type}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-title)' }}>
                        {m.title}
                      </h4>
                      {m.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <a 
                      href={m.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-outline btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '36px' }}
                    >
                      <ExternalLink size={14} />
                      Access
                    </a>

                    {isLecturer && (
                      <button 
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove material "${m.title}"?`)) {
                            onDeleteMaterial(m.id);
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
                        title="Delete Material"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredMaterials.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                No materials posted for the selected filter queries.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
