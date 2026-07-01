import React, { useState } from 'react';
import { FileText, Calendar, Users, CheckCircle, Clock, Upload, ArrowRight, X, AlertTriangle } from 'lucide-react';

export default function AssignmentSubmitter({ 
  assignments, 
  submissions, 
  courses, 
  users, 
  currentStudentId, 
  onSubmitAssignment 
}) {
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const student = users.find(u => u.id === currentStudentId) || users[0];
  const studentGroupId = student.groupId;

  // Retrieve submission details if already made
  const getSubmissionStatus = (assign) => {
    // If it is a group assignment, check if anyone from the same group submitted
    if (assign.isGroup) {
      if (!studentGroupId) {
        return { submitted: false, noGroup: true };
      }
      const groupSub = submissions.find(s => s.taskId === assign.id && s.isGroupSubmission && s.groupId === studentGroupId);
      if (groupSub) {
        const submitter = users.find(u => u.id === groupSub.studentId);
        return { 
          submitted: true, 
          score: groupSub.score, 
          feedback: groupSub.feedback,
          attachmentName: groupSub.attachmentName,
          submissionText: groupSub.submissionText,
          submittedAt: groupSub.submittedAt,
          submitterName: submitter ? submitter.name : 'Group Member'
        };
      }
      return { submitted: false };
    }

    // Individual assignment check
    const indSub = submissions.find(s => s.taskId === assign.id && s.studentId === currentStudentId && s.type === 'assignment');
    if (indSub) {
      return { 
        submitted: true, 
        score: indSub.score, 
        feedback: indSub.feedback,
        attachmentName: indSub.attachmentName,
        submissionText: indSub.submissionText,
        submittedAt: indSub.submittedAt,
        submitterName: 'You'
      };
    }

    return { submitted: false };
  };

  const handleOpenSubmit = (assign) => {
    setSubmittingAssignment(assign);
    setSubmissionText('');
    setAttachmentName('');
    setSelectedFile(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!attachmentName) {
      alert('Please select a file to submit.');
      return;
    }

    onSubmitAssignment(
      submittingAssignment.id, 
      submittingAssignment.isGroup,
      studentGroupId,
      student.groupName,
      attachmentName,
      submissionText,
      selectedFile
    );

    setSubmittingAssignment(null);
  };

  const mockFileOptions = [
    'Academic_Term_Report.docx',
    'Main_SystemArchitecture_v2.pdf',
    'SourceCode_Draft.zip',
    'Group_Project_Presentation.pptx',
    'Lab_Exercise_3.pdf'
  ];

  return (
    <div>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>My Course Assignments</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Review assignments sheets, upload individual homework, and coordinate group term deliverables.
        </p>
      </div>

      {/* Grid of Student Assignments */}
      <div className="grid-container" style={{ marginTop: '24px' }}>
        {assignments.map(assign => {
          const course = courses.find(c => c.id === assign.courseId);
          const status = getSubmissionStatus(assign);
          const isGraded = status.submitted && status.score !== undefined && status.score !== null;

          return (
            <div key={assign.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-primary">{course ? course.code : 'General'}</span>
                  <span className={`badge ${assign.isGroup ? 'badge-warning' : 'badge-info'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {assign.isGroup ? <Users size={12} /> : <FileText size={12} />}
                    {assign.isGroup ? 'Group Project' : 'Individual'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px' }}>{assign.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {assign.description || 'Instructions uploaded by Dr. Bello.'}
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>Deadline: <strong>{assign.dueDate}</strong></span>
                  <span>Max Points: <strong>{assign.maxScore}</strong></span>
                </div>
              </div>

              {/* Submission State Footer */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '14px' }}>
                {status.noGroup ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: '600' }}>
                      <AlertTriangle size={16} />
                      <span>No Group Assigned yet!</span>
                    </div>
                    <button className="btn btn-outline btn-sm" disabled style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>
                      Submit Locked
                    </button>
                  </div>
                ) : status.submitted ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                          {isGraded ? 'Graded' : 'Submitted'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', marginLeft: 'auto', color: isGraded ? 'var(--primary)' : 'var(--color-warning)' }}>
                        {isGraded ? `${status.score} / ${assign.maxScore}` : 'Pending Grade'}
                      </span>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-app)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📄 <strong>{status.attachmentName}</strong>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                        Uploaded by: {status.submitterName}
                      </div>

                      {isGraded && status.feedback && (
                        <div style={{ marginTop: '8px', borderTop: '1px dashed var(--border)', paddingTop: '6px' }}>
                          <strong>Lecturer Feedback:</strong>
                          <p style={{ color: 'var(--primary)', fontStyle: 'italic', marginTop: '2px' }}>
                            "{status.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                    <button 
                      className="btn btn-outline btn-sm" 
                      onClick={() => handleOpenSubmit(assign)}
                    >
                      Resubmit Work
                    </button>
                  </div>
                ) : (
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ width: '100%' }}
                    onClick={() => handleOpenSubmit(assign)}
                  >
                    Submit Assignment
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {assignments.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
            <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>No Assignments Listed</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You have no pending assignments in your registered courses.</p>
          </div>
        )}
      </div>

      {/* Submission Upload Sheet Modal */}
      {submittingAssignment && (
        <div className="modal-overlay" onClick={() => setSubmittingAssignment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-primary">{courses.find(c => c.id === submittingAssignment.courseId)?.code}</span>
                <h3 style={{ fontSize: '1.2rem', marginTop: '4px' }}>Submit: {submittingAssignment.title}</h3>
              </div>
              <button className="modal-close" onClick={() => setSubmittingAssignment(null)}>
                <X size={20} />
              </button>
            </div>

            {submittingAssignment.isGroup && (
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                padding: '12px', 
                backgroundColor: 'rgba(223, 177, 25, 0.1)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid rgba(223, 177, 25, 0.2)', 
                marginBottom: '20px', 
                fontSize: '0.8rem' 
              }}>
                <Users size={18} style={{ color: 'var(--secondary-hover)', flexShrink: 0 }} />
                <div>
                  <strong>Group Assignment Action</strong>: You are submitting this on behalf of <strong>{student.groupName}</strong>. 
                  All group members will share this submission and receive the same synchronized grades.
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Upload File Attachment</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-app)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'border-color var(--transition-fast)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <input 
                      type="file"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          setSelectedFile(file);
                          setAttachmentName(file.name);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer'
                      }}
                      required
                    />
                    <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto', display: 'block' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-title)' }}>
                      {selectedFile ? selectedFile.name : 'Click to select or drag your file here'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Supports PDF, ZIP, DOCX, PNG, etc. up to 25MB'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Submission Remarks / Notes</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Type remarks or explain who worked on what (for group submissions)..." 
                  value={submissionText}
                  onChange={e => setSubmissionText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setSubmittingAssignment(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
