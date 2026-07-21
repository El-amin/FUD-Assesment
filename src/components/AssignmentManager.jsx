import React, { useState } from 'react';
import { 
  PlusCircle, 
  Calendar, 
  Users, 
  X, 
  FileText, 
  CheckCircle, 
  Clock, 
  Award, 
  Eye, 
  Code, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  FileCode,
  Folder,
  Layers,
  Sparkles,
  Upload,
  Search
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

// --- MOCK INTERACTIVE DOCUMENT PREVIEW COMPONENT ---
function DocPreviewInner({ fileName = '', submission, studentName }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeZipFile, setActiveZipFile] = useState('README.md');

  if (!fileName) return null;
  const fileExt = fileName.split('.').pop().toLowerCase();

  // 1. ZIP File Code Explorer Mock
  if (fileExt === 'zip') {
    const zipFiles = {
      'README.md': `# FUD Student Registry System
This is our COSC 301 project submission. We have built an automated course enrollment registry.

## Technologies Used
- Frontend: HTML5, CSS3, Vanilla JS
- Backend: Node.js, Express
- Database: SQLite

## Group Members (Group Alpha)
1. Aliyu Ibrahim (aliyu@fud.edu.ng)
2. Fatima Abubakar (fatima@fud.edu.ng)`,
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>FUD Registry portal</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
        <header>
            <h1>FUD Course Assessment Portal</h1>
        </header>
        <main>
            <!-- Course Registration form -->
            <form id="regForm">
                <input type="text" placeholder="Enter Matric Number" required>
                <button type="submit">Submit Registration</button>
            </form>
        </main>
    </div>
    <script src="app.js"></script>
</body>
</html>`,
      'app.js': `// Server app setup for FUD Registry
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/register', (req, res) => {
    const { matricNo, courses } = req.body;
    console.log(\`Registering student: \${matricNo}\`);
    return res.status(200).json({ 
        status: 'success', 
        message: 'Successfully enrolled' 
    });
});

app.listen(PORT, () => {
    console.log(\`FUD Registry app serving on http://localhost:\${PORT}\`);
});`,
      'styles.css': `:root {
    --primary: #0a5c36;
    --secondary: #dfb119;
    --dark: #1e293b;
}

body {
    font-family: 'Outfit', sans-serif;
    background-color: #f8fafc;
    margin: 0;
}

header {
    background-color: var(--primary);
    color: white;
    padding: 20px;
    text-align: center;
    border-bottom: 4px solid var(--secondary);
}`
    };

    return (
      <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', height: '420px', overflow: 'hidden', fontFamily: 'monospace', fontSize: '0.85rem' }}>
        {/* Zip sidebar */}
        <div style={{ width: '180px', backgroundColor: 'var(--bg-app)', borderRight: '1px solid var(--border)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: 'var(--text-title)', marginBottom: '8px' }}>
            <Folder size={16} style={{ color: 'var(--secondary-hover)' }} />
            <span>{fileName}</span>
          </div>
          {Object.keys(zipFiles).map(name => (
            <button
              key={name}
              onClick={() => setActiveZipFile(name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                border: 'none',
                background: activeZipFile === name ? 'rgba(10, 92, 54, 0.1)' : 'none',
                color: activeZipFile === name ? 'var(--primary)' : 'var(--text-main)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeZipFile === name ? 'bold' : 'normal',
                fontFamily: 'monospace'
              }}
            >
              <FileCode size={14} style={{ color: activeZipFile === name ? 'var(--primary)' : 'var(--text-muted)' }} />
              {name}
            </button>
          ))}
        </div>
        {/* Editor panel */}
        <div style={{ flexGrow: 1, backgroundColor: '#0f172a', color: '#cbd5e1', padding: '16px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
          <code style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
            {zipFiles[activeZipFile]}
          </code>
        </div>
      </div>
    );
  }

  // 2. PPTX Slideshow Mock
  if (fileExt === 'pptx') {
    const slides = [
      {
        title: "automated Student Registry portal",
        subtitle: `Course Code: COSC 301 (Software Engineering)\nSubmitted by: ${submission.groupName || studentName}\nDepartment of Computer Science, FUD Dutse`,
        content: ["Group presentation on automated registration services", "Supervised by Dr. Bello", "Academic session 2025/2026"]
      },
      {
        title: "Problem Statement",
        subtitle: "Why automate registry systems?",
        content: [
          "Manual queues during course selection cause delays.",
          "High error rate in manual form verification.",
          "Difficulty in tracing prerequisite courses dynamically.",
          "Difficulty syncing logs with FUD Assessment System databases."
        ]
      },
      {
        title: "Proposed System Architecture",
        subtitle: "System design specifications",
        content: [
          "Responsive React Dashboard web app client.",
          "Secure authentication middleware.",
          "SQL Database for persistent records.",
          "Automated enrollment validation algorithms."
        ]
      },
      {
        title: "Group Contributions & Summary",
        subtitle: "How we divided the software tasks",
        content: [
          "Aliyu Ibrahim: Express backend controllers and database schemas.",
          "Fatima Abubakar: UI component states, dashboard layout, CSS styles.",
          "Result: A functional, high-fidelity portal clone!"
        ]
      }
    ];

    const currentSlide = slides[activeSlide];

    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column', height: '420px', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>
          Slide {activeSlide + 1} of {slides.length}
        </div>
        
        {/* Slide Body */}
        <div style={{ marginTop: '20px' }}>
          <span className="badge badge-warning" style={{ fontSize: '0.65rem', marginBottom: '8px' }}>PPTX PREVIEW</span>
          <h3 style={{ color: 'var(--secondary)', fontSize: '1.4rem', fontWeight: '800', marginBottom: '4px', fontFamily: 'var(--font-title)' }}>
            {currentSlide.title}
          </h3>
          <h5 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px', fontStyle: 'italic' }}>
            {currentSlide.subtitle}
          </h5>
          <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1' }}>
            {currentSlide.content.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>

        {/* Slide navigation controller */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '12px', marginTop: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PowerPoint Simulator</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button"
              className="btn btn-outline btn-sm" 
              onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
              disabled={activeSlide === 0}
              style={{ color: 'white', borderColor: '#334155', opacity: activeSlide === 0 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button 
              type="button"
              className="btn btn-primary btn-sm" 
              onClick={() => setActiveSlide(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={activeSlide === slides.length - 1}
              style={{ opacity: activeSlide === slides.length - 1 ? 0.4 : 1 }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. PDF Document Mock & Viewer
  if (fileExt === 'pdf') {
    const getPdfUrl = () => {
      if (!isSupabaseConfigured) return null;
      const originalExt = fileName.split('.').pop();
      const path = `${submission.id}.${originalExt}`;
      const { data } = supabase.storage.from('submissions').getPublicUrl(path);
      return data?.publicUrl;
    };
    const publicUrl = getPdfUrl();

    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', height: '550px', overflow: 'hidden', backgroundColor: 'var(--bg-app)' }}>
        {publicUrl ? (
          <iframe 
            src={publicUrl} 
            title={fileName} 
            style={{ width: '100%', height: '100%', border: 'none' }} 
          />
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', height: '420px', overflowY: 'auto', backgroundColor: '#525659', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* PDF Top Bar Control Menu */}
            <div style={{ backgroundColor: '#323639', padding: '8px 16px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#f1f1f1', fontSize: '0.8rem', sticky: 'top' }}>
              <span>📄 {fileName} (Local Sandbox)</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span>Page 1 of 2</span>
                <span>|</span>
                <span>Zoom: 100%</span>
              </div>
            </div>

            {/* PDF Page Canvas */}
            <div style={{ backgroundColor: 'white', color: '#1e293b', padding: '40px', boxShadow: '0 4px 8px rgba(0,0,0,0.15)', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '520px', fontSize: '0.85rem', lineHeight: '1.5' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0a5c36', paddingBottom: '12px', marginBottom: '12px' }}>
                <h4 style={{ color: '#0a5c36', fontSize: '1.2rem', fontWeight: 'bold' }}>FUD Assessment System</h4>
                <h5 style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Academic Term Work Transcript</h5>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.75rem', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <div><strong>Task:</strong> {submission.title || 'Assignment Report'}</div>
                <div><strong>Course:</strong> Computer Science Dept</div>
                <div><strong>Author:</strong> {studentName}</div>
                <div><strong>Group:</strong> {submission.groupName || 'Individual'}</div>
              </div>

              <h5 style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#0a5c36', marginTop: '10px' }}>1. Executive Summary</h5>
              <p>
                This document outlines our implementation plan for developing course registration databases. We focus on normalized schemas (3NF) to eliminate redundancies, optimize join times, and establish strict integrity key matches for primary keys.
              </p>

              <h5 style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#0a5c36', marginTop: '10px' }}>2. Simulated ERD Diagram</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', backgroundColor: '#f4f7f5', borderRadius: '6px', border: '1px dashed #0a5c36', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ border: '2px solid #0a5c36', borderRadius: '4px', padding: '6px 12px', backgroundColor: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>
                    [STUDENTS]<br/><span style={{ fontSize: '0.6rem', color: '#64748b' }}>MatricNo (PK)</span>
                  </div>
                  <div style={{ color: '#0a5c36', fontSize: '0.8rem' }}>──(1:N)──</div>
                  <div style={{ border: '2px solid #dfb119', borderRadius: '4px', padding: '6px 12px', backgroundColor: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>
                    [ENROLLMENT]<br/><span style={{ fontSize: '0.6rem', color: '#64748b' }}>EnrollID (PK)</span>
                  </div>
                  <div style={{ color: '#0a5c36', fontSize: '0.8rem' }}>──(N:1)──</div>
                  <div style={{ border: '2px solid #0a5c36', borderRadius: '4px', padding: '6px 12px', backgroundColor: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>
                    [COURSES]<br/><span style={{ fontSize: '0.6rem', color: '#64748b' }}>CourseID (PK)</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', fontStyle: 'italic' }}>Figure 1.1: Simplified Course Registration Relational Model Schema</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. DOCX Document Mock & Viewer
  if (fileExt === 'docx' || fileExt === 'doc') {
    const getDocxUrl = () => {
      if (!isSupabaseConfigured) return null;
      const originalExt = fileName.split('.').pop();
      const path = `${submission.id}.${originalExt}`;
      const { data } = supabase.storage.from('submissions').getPublicUrl(path);
      return data?.publicUrl;
    };
    const publicUrl = getDocxUrl();
    const officeViewerUrl = publicUrl 
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`
      : null;

    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', height: '550px', overflow: 'hidden', backgroundColor: 'var(--bg-app)' }}>
        {officeViewerUrl ? (
          <iframe 
            src={officeViewerUrl} 
            title={fileName} 
            style={{ width: '100%', height: '100%', border: 'none' }} 
            frameBorder="0"
          />
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', height: '420px', overflowY: 'auto', backgroundColor: '#e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              backgroundColor: '#ffffff', 
              color: '#334155', 
              width: '100%', 
              maxWidth: '560px', 
              minHeight: '500px', 
              padding: '40px', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', 
              fontFamily: 'serif', 
              fontSize: '0.9rem',
              lineHeight: '1.6',
              textAlign: 'justify'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontStyle: 'italic', fontFamily: 'var(--font-sans)', display: 'block', marginBottom: '8px' }}>
                  MS Word Simulator (.docx)
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e293b' }}>
                  TERM DELIVERABLE REPORT
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Submitted by: {studentName} ({submission.groupName || 'Individual'})
                </p>
              </div>

              <p style={{ textIndent: '30px', marginBottom: '14px' }}>
                The objective of this software system design laboratory report is to present our comprehensive solutions for the course enrollment portal assignments. Our group developed an E-Learning portal layout incorporating essential features like assignment graders, quizzes taking engines, and course lists.
              </p>

              <p style={{ textIndent: '30px', marginBottom: '14px' }}>
                For maximum flexibility and styling integrity, our software utilized CSS variables mapping, responsive sidebar panels, and interactive wizard toggles that allow a supervisor or lecturer to toggle roles dynamically. The dynamic states are kept in persistent client-side containers so that supervisor inspections are streamlined.
              </p>

              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 'bold', color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>
                System Integrity & Validation
              </h4>
              <p>
                We implemented a robust validation trigger. The timers for examinations are secured by keyframe clocks and auto-submit hooks that preserve user marks. When a user submits team assignments, the score aggregates automatically for all group circles.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Image Previewer
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'];
  if (imageExts.includes(fileExt)) {
    // Get live Supabase public URL
    const getImageUrl = () => {
      if (!isSupabaseConfigured) return null;
      const originalExt = fileName.split('.').pop();
      const path = `${submission.id}.${originalExt}`;
      const { data } = supabase.storage.from('submissions').getPublicUrl(path);
      return data?.publicUrl;
    };
    const publicUrl = getImageUrl();

    return (
      <div style={{ 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-md)', 
        padding: '16px', 
        backgroundColor: 'var(--bg-app)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '12px'
      }}>
        {publicUrl ? (
          <img 
            src={publicUrl} 
            alt={fileName} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '480px', 
              objectFit: 'contain', 
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border)'
            }} 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : null}
        
        <div style={{ 
          display: publicUrl ? 'none' : 'block',
          width: '100%',
          maxWidth: '400px',
          padding: '24px', 
          textAlign: 'center', 
          border: '2px dashed var(--border)', 
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-card)'
        }}>
          🖼️ <strong>Image File: {fileName}</strong>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            In local sandbox mode, images are simulated. In online Supabase mode, the actual uploaded image will display here.
          </p>
        </div>
      </div>
    );
  }

  // Fallback View
  return (
    <div style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-app)' }}>
      <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
      <h4>General File Preview</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{fileName}</p>
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'left', fontSize: '0.8rem', fontStyle: 'italic' }}>
        "{submission.submissionText || 'No comments uploaded with file.'}"
      </div>
    </div>
  );
}

function DocPreview({ fileName = '', submission, studentName }) {
  if (!fileName) {
    return (
      <div style={{ padding: '24px', backgroundColor: 'var(--bg-app)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
        <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto', display: 'block' }} />
        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-title)' }}>No File Attached</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>This submission does not contain any file attachments.</p>
      </div>
    );
  }
  const fileExt = fileName.split('.').pop().toLowerCase();
  
  // Try retrieving the public Supabase URL for direct download
  const getStorageUrl = () => {
    if (!isSupabaseConfigured) return null;
    const originalExt = fileName.split('.').pop();
    const path = `${submission.id}.${originalExt}`;
    const { data } = supabase.storage.from('submissions').getPublicUrl(path);
    return data?.publicUrl;
  };

  const publicUrl = getStorageUrl();

  const downloadButton = publicUrl ? (
    <a 
      href={publicUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="btn btn-primary btn-sm"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', height: '32px' }}
      download={fileName}
    >
      <Upload size={14} style={{ transform: 'rotate(180deg)' }} />
      Download File
    </a>
  ) : (
    <button 
      onClick={() => alert("Direct file download is only available in Supabase connected mode. In local sandbox mode, you can inspect simulated file previews.")}
      className="btn btn-outline btn-sm"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '32px', color: 'var(--text-main)', borderColor: 'var(--border)' }}
    >
      Mock Download
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Universal Action Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 16px', 
        backgroundColor: 'var(--bg-app)', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-md)' 
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-title)' }}>
          📄 Original File Attachment: <strong>{fileName}</strong>
        </div>
        {downloadButton}
      </div>
      
      {/* Preview container */}
      <DocPreviewInner fileName={fileName} submission={submission} studentName={studentName} />
    </div>
  );
}

export default function AssignmentManager({ 
  courses, 
  assignments, 
  submissions, 
  users, 
  onAddAssignment, 
  onUpdateAssignment,
  onGradeSubmission 
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignmentForReview, setSelectedAssignmentForReview] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [submissionSearch, setSubmissionSearch] = useState('');
  
  // Workspace Active Submissions (Null if none selected for preview/grading)
  const [activeSubmission, setActiveSubmission] = useState(null);

  // Form State
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [viewingAssignmentDetails, setViewingAssignmentDetails] = useState(null);
  const [maxScore, setMaxScore] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [errors, setErrors] = useState({});

  // Inline Grading Form State (Updates when activeSubmission is selected)
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  // AI Grading States
  const [gradingMode, setGradingMode] = useState('manual');
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('fud_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });
  const [saveApiKeyLocally, setSaveApiKeyLocally] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiGeneratedTag, setAiGeneratedTag] = useState(false);

  const handleOpenCreateModal = () => {
    setEditingAssignment(null);
    setCourseId(courses[0]?.id || '');
    setTitle('');
    setDescription('');
    setQuestions('');
    setAttachmentFile(null);
    setAttachmentName('');
    setMaxScore(100);
    setDueDate('');
    setIsGroup(false);
    setErrors({});
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (assign) => {
    setEditingAssignment(assign);
    setCourseId(assign.courseId);
    setTitle(assign.title);
    setDescription(assign.description || '');
    setQuestions(assign.questions || '');
    setAttachmentFile(null);
    setAttachmentName(assign.attachmentName || '');
    setMaxScore(assign.maxScore);
    setDueDate(assign.dueDate);
    setIsGroup(assign.isGroup);
    setErrors({});
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setTitle('');
    setDescription('');
    setQuestions('');
    setAttachmentFile(null);
    setAttachmentName('');
    setMaxScore(100);
    setDueDate('');
    setIsGroup(false);
    setEditingAssignment(null);
    setErrors({});
    setShowCreateModal(false);
  };

  const handleSaveAssignment = (e) => {
    e.preventDefault();

    // Validate
    const formErrors = {};
    if (!title.trim()) formErrors.title = 'Title is required';
    if (!dueDate) formErrors.dueDate = 'Due date is required';
    if (maxScore <= 0) formErrors.maxScore = 'Max score must be positive';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (editingAssignment) {
      const updatedAssignment = {
        ...editingAssignment,
        courseId,
        title,
        description,
        questions,
        attachmentName: attachmentFile ? attachmentFile.name : attachmentName,
        maxScore: parseInt(maxScore),
        dueDate,
        isGroup
      };
      onUpdateAssignment(updatedAssignment, attachmentFile);
    } else {
      const newAssignment = {
        id: 'assign_' + Date.now().toString(),
        courseId,
        title,
        description,
        questions,
        attachmentName: attachmentFile ? attachmentFile.name : '',
        maxScore: parseInt(maxScore),
        dueDate,
        isGroup
      };
      onAddAssignment(newAssignment, attachmentFile);
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setQuestions('');
    setAttachmentFile(null);
    setAttachmentName('');
    setMaxScore(100);
    setDueDate('');
    setIsGroup(false);
    setEditingAssignment(null);
    setErrors({});
    setShowCreateModal(false);
  };

  const handleSelectActiveSubmission = (sub) => {
    setActiveSubmission(sub);
    setGradeScore(sub.score !== undefined && sub.score !== null ? sub.score.toString() : '');
    setGradeFeedback(sub.feedback || '');
    setAiGeneratedTag(false);
    setAiError('');
  };

  const handleGenerateAiGrade = async (studentObj) => {
    if (!geminiApiKey.trim()) {
      setAiError('Please enter a Gemini API Key to use AI grading.');
      return;
    }

    setIsAiLoading(true);
    setAiError('');

    try {
      const promptText = `You are an expert university professor grading assignments for a computer science/academic course.
Evaluate the following student submission and provide a suggested score and short, constructive feedback.

Assignment Details:
- Title: "${selectedAssignmentForReview.title}"
- Description: "${selectedAssignmentForReview.description || 'N/A'}"
- Maximum Possible Score: ${selectedAssignmentForReview.maxScore || 100}

Student Submission Details:
- Student Name: "${studentObj?.name || 'Unknown'}"
- Submission Text/Content: "${activeSubmission.submissionText || 'No text content provided.'}"
- Attachment Filename: "${activeSubmission.attachmentName || 'No attachment file.'}"

Your task:
1. Analyze the student's submission carefully.
2. Determine an appropriate integer score between 0 and ${selectedAssignmentForReview.maxScore || 100}.
3. Provide objective, helpful feedback (2-4 sentences) summarizing what they did well and how they could improve.
4. Output your response EXACTLY as a valid JSON object in this format:
{
  "score": <integer_score>,
  "feedback": "<constructive_feedback_comments>"
}
Do not include any extra text, explanations, or markdown blocks outside the JSON object.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey.trim()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      const rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!rawText) {
        throw new Error('Received empty response from Gemini API.');
      }

      // Parse JSON from raw response text
      let cleanedText = rawText.trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
      }
      cleanedText = cleanedText.trim();

      // Find first '{' and last '}' to handle any stray text
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }

      const resultObj = JSON.parse(cleanedText);
      
      if (typeof resultObj.score !== 'number' || !resultObj.feedback) {
        throw new Error('AI returned an invalid response structure.');
      }

      // Constrain score
      const finalScore = Math.max(0, Math.min(selectedAssignmentForReview.maxScore, Math.round(resultObj.score)));

      setGradeScore(finalScore.toString());
      setGradeFeedback(resultObj.feedback);
      setAiGeneratedTag(true);

      // Save key locally if enabled
      if (saveApiKeyLocally) {
        localStorage.setItem('fud_gemini_api_key', geminiApiKey.trim());
      }
    } catch (err) {
      console.error('AI grading error:', err);
      setAiError(err.message || 'An error occurred while generating the AI grade.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveGradeInline = (e) => {
    e.preventDefault();

    const scoreNum = parseInt(gradeScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > activeSubmission.maxScore) {
      alert(`Please enter a valid grade between 0 and ${activeSubmission.maxScore}.`);
      return;
    }

    onGradeSubmission(activeSubmission.id, scoreNum, gradeFeedback);
    
    // Update local active state so UI renders graded status immediately
    setActiveSubmission({
      ...activeSubmission,
      score: scoreNum,
      feedback: gradeFeedback
    });

    alert("Grade successfully applied!");
  };

  // Get submissions for a specific assignment (resilient to duplicate student/group rows, keeping only the latest)
  const getSubmissionsForAssignment = (assignId) => {
    const allSubs = submissions.filter(sub => sub.taskId === assignId && sub.type === 'assignment');
    
    // Sort descending by ID to ensure latest submissions are processed first
    const sortedSubs = [...allSubs].sort((a, b) => b.id.localeCompare(a.id));
    
    const uniqueSubs = [];
    const seen = new Set();
    
    for (const sub of sortedSubs) {
      const key = sub.isGroupSubmission ? `group_${sub.groupId}` : `student_${sub.studentId}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSubs.push(sub);
      }
    }
    
    // Reverse it back to chronological order (earliest submissions first in UI list)
    return uniqueSubs.reverse();
  };

  const handleOpenReviewPanel = (assign) => {
    setSelectedAssignmentForReview(assign);
    setActiveSubmission(null); // Reset preview
    setSubmissionSearch(''); // Reset search query
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Manage Assignments</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Publish homework, group projects, preview submissions online, and record marks.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <PlusCircle size={18} />
          Publish New Assignment
        </button>
      </div>

      {/* Grid of Assignments */}
      <div className="grid-container">
        {assignments.map(assign => {
          const course = courses.find(c => c.id === assign.courseId);
          const assignSubmissions = getSubmissionsForAssignment(assign.id);
          const gradedCount = assignSubmissions.filter(sub => sub.score !== undefined && sub.score !== null).length;
          const pendingCount = assignSubmissions.length - gradedCount;

          return (
            <div key={assign.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-primary">{course ? course.code : 'General'}</span>
                  <span className={`badge ${assign.isGroup ? 'badge-warning' : 'badge-info'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {assign.isGroup ? <Users size={12} /> : <FileText size={12} />}
                    {assign.isGroup ? 'Group Work' : 'Individual'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px' }}>{assign.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {assign.description || 'No description provided.'}
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>Due Date: <strong>{assign.dueDate}</strong></span>
                  <span>Maximum Points: <strong>{assign.maxScore}</strong></span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span>Pending: <strong style={{ color: pendingCount > 0 ? 'var(--color-warning)' : 'inherit' }}>{pendingCount}</strong></span>
                  <span>Graded: <strong>{gradedCount}</strong></span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ flexGrow: 1 }}
                    onClick={() => handleOpenReviewPanel(assign)}
                  >
                    Grade & Preview ({assignSubmissions.length})
                  </button>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleOpenEditModal(assign)}
                    style={{ flexShrink: 0, color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    title="Edit Assignment Details"
                  >
                    Edit
                  </button>
                </div>
                <button 
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => setViewingAssignmentDetails(assign)}
                >
                  <Eye size={14} />
                  View Questions
                </button>
              </div>
            </div>
          );
        })}

        {assignments.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
            <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>No Assignments Uploaded</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create individual or group assignments for students.</p>
          </div>
        )}
      </div>

      {/* Modern Split-Pane Review & Grading Modal Workspace */}
      {selectedAssignmentForReview && (() => {
        const assignSubmissions = getSubmissionsForAssignment(selectedAssignmentForReview.id);
        const course = courses.find(c => c.id === selectedAssignmentForReview.courseId);
        
        return (
          <div className="modal-overlay" onClick={() => setSelectedAssignmentForReview(null)}>
            <div className="modal-content" style={{ maxWidth: '1250px', width: '95%', maxHeight: '95vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '24px' }} onClick={e => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="modal-header" style={{ marginBottom: '16px', flexShrink: 0 }}>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '4px' }}>{course ? course.code : 'Course'}</span>
                  <h3 style={{ fontSize: '1.3rem' }}>Grading Hub: {selectedAssignmentForReview.title}</h3>
                </div>
                <button className="modal-close" onClick={() => setSelectedAssignmentForReview(null)}>
                  <X size={20} />
                </button>
              </div>

              {/* Split Workspace */}
              <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', overflow: 'hidden', flexGrow: 1 }}>
                
                {/* LEFT COLUMN: Submissions List roster */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', borderRight: '1px solid var(--border)', paddingRight: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                      Student Submissions ({assignSubmissions.length})
                    </h4>
                    
                    {/* Search Input Bar */}
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input 
                        type="text" 
                        placeholder="Search student or matric number..." 
                        value={submissionSearch}
                        onChange={e => setSubmissionSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 36px',
                          fontSize: '0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-title)',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <Search 
                        size={16} 
                        style={{ 
                          position: 'absolute', 
                          left: '12px', 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          color: 'var(--text-muted)' 
                        }} 
                      />
                    </div>
                  </div>

                   {(() => {
                    const filteredSubmissions = assignSubmissions.filter(sub => {
                      const studentObj = users.find(u => u.id === sub.studentId);
                      const sName = studentObj ? studentObj.name.toLowerCase() : '';
                      const sEmail = studentObj ? studentObj.email.toLowerCase() : '';
                      const q = submissionSearch.toLowerCase().trim();
                      return sName.includes(q) || sEmail.includes(q) || (sub.groupName && sub.groupName.toLowerCase().includes(q));
                    });

                    // Sort: Ungraded/Pending submissions first, Graded submissions last
                    const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
                      const aGraded = a.score !== undefined && a.score !== null;
                      const bGraded = b.score !== undefined && b.score !== null;
                      if (aGraded && !bGraded) return 1;
                      if (!aGraded && bGraded) return -1;
                      return 0;
                    });

                    return (
                      <>
                        {sortedSubmissions.map(sub => {
                          const studentObj = users.find(u => u.id === sub.studentId);
                          const isSelected = activeSubmission?.id === sub.id;
                          
                          // For group assignment, list group members
                          const members = selectedAssignmentForReview.isGroup 
                            ? users.filter(u => u.groupId === sub.groupId)
                            : [];

                          const hasGrade = sub.score !== undefined && sub.score !== null;

                          return (
                            <div 
                              key={sub.id} 
                              onClick={() => handleSelectActiveSubmission(sub)}
                              style={{
                                padding: '14px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid',
                                borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                                backgroundColor: isSelected ? 'rgba(10, 92, 54, 0.03)' : 'var(--bg-card)',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                                position: 'relative'
                              }}
                            >
                              {isSelected && (
                                <div style={{ width: '4px', position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: 'var(--primary)', borderTopLeftRadius: 'var(--radius-md)', borderBottomLeftRadius: 'var(--radius-md)' }} />
                              )}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-title)' }}>
                                  {studentObj?.name || 'Unknown'}
                                </span>
                                <span className={`badge ${hasGrade ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                                  {hasGrade ? `${sub.score} / ${selectedAssignmentForReview.maxScore}` : 'Pending'}
                                </span>
                              </div>

                              {selectedAssignmentForReview.isGroup ? (
                                <span className="badge badge-warning" style={{ fontSize: '0.65rem', marginBottom: '6px' }}>{sub.groupName}</span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Individual</span>
                              )}

                              <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                                  📄 {sub.attachmentName || 'Submission.pdf'}
                                </span>
                                <span>{sub.submittedAt}</span>
                              </div>
                            </div>
                          );
                        })}

                        {assignSubmissions.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <Clock size={32} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
                            <p>No submissions uploaded yet.</p>
                          </div>
                        )}

                        {assignSubmissions.length > 0 && filteredSubmissions.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <AlertCircle size={32} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
                            <p>No submissions match your search.</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* RIGHT COLUMN: Interactive Document Preview & Grade Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingLeft: '4px' }}>
                  {activeSubmission ? (() => {
                    const studentObj = users.find(u => u.id === activeSubmission.studentId);
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Preview Top Header info bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                              INSPECTING FILE SUBMISSION WITHOUT DOWNLOADS
                            </span>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                              {activeSubmission.attachmentName}
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Matriculate: {studentObj?.email} • Group Name: {activeSubmission.groupName || 'N/A'}
                            </p>
                          </div>
                          
                          <a 
                            href={`#`} 
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`Simulating secure download for: ${activeSubmission.attachmentName}`);
                            }}
                            className="btn btn-outline btn-sm"
                          >
                            Download Copy
                          </a>
                        </div>

                        {/* Submission Remarks */}
                        {activeSubmission.submissionText && (
                          <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-app)', borderLeft: '4px solid var(--primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                            <strong>Student Submission Notes:</strong>
                            <p style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                              "{activeSubmission.submissionText}"
                            </p>
                          </div>
                        )}

                        {/* Interactive Preview Canvas */}
                        <DocPreview 
                          fileName={activeSubmission.attachmentName} 
                          submission={activeSubmission}
                          studentName={studentObj?.name || 'Unknown Student'}
                        />

                        {/* Inline Keyframe Styles for AI Spinner */}
                        <style>{`
                          @keyframes ai-spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                          }
                          .ai-spinner-icon {
                            animation: ai-spin 1s linear infinite;
                          }
                        `}</style>

                        {/* Grading Form Panel */}
                        <div className="card" style={{ border: '1px solid var(--primary)', borderLeft: '4px solid var(--primary)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                              <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Grading Form Sheet</h4>
                            </div>
                            
                            {/* Grading Mode Toggle */}
                            <div style={{ display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setGradingMode('manual');
                                  setAiError('');
                                }}
                                style={{
                                  padding: '5px 12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  backgroundColor: gradingMode === 'manual' ? 'var(--primary)' : 'transparent',
                                  color: gradingMode === 'manual' ? 'white' : 'var(--text-title)',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                Manual
                              </button>
                              <button
                                type="button"
                                onClick={() => setGradingMode('ai')}
                                style={{
                                  padding: '5px 12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  backgroundColor: gradingMode === 'ai' ? 'var(--primary)' : 'transparent',
                                  color: gradingMode === 'ai' ? 'white' : 'var(--text-title)',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Sparkles size={12} />
                                AI Assistant
                              </button>
                            </div>
                          </div>

                          {/* AI Assistant Setup Form */}
                          {gradingMode === 'ai' && (
                            <div style={{ 
                              padding: '12px', 
                              backgroundColor: 'rgba(10, 92, 54, 0.03)', 
                              border: '1px dashed var(--primary)', 
                              borderRadius: 'var(--radius-md)', 
                              marginBottom: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                <Sparkles size={14} />
                                <span>AI Grading Assistant</span>
                              </div>
                              
                              <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Gemini API Key</label>
                                <input 
                                  type="password"
                                  className="form-input"
                                  placeholder="Enter your Gemini API Key..."
                                  value={geminiApiKey}
                                  onChange={e => setGeminiApiKey(e.target.value)}
                                  style={{ fontSize: '0.8rem', padding: '6px 10px', height: '32px', margin: 0 }}
                                />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input 
                                  type="checkbox"
                                  id="saveApiKey"
                                  checked={saveApiKeyLocally}
                                  onChange={e => setSaveApiKeyLocally(e.target.checked)}
                                  style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                />
                                <label htmlFor="saveApiKey" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                                  Save API Key in browser local storage
                                </label>
                              </div>

                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                disabled={isAiLoading || !geminiApiKey.trim()}
                                onClick={() => handleGenerateAiGrade(studentObj)}
                                style={{ 
                                  width: '100%', 
                                  padding: '6px', 
                                  fontSize: '0.8rem', 
                                  height: '32px',
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  gap: '6px',
                                  margin: 0
                                }}
                              >
                                {isAiLoading ? (
                                  <>
                                    <span className="ai-spinner-icon" style={{ 
                                      width: '12px', 
                                      height: '12px', 
                                      border: '2px solid white', 
                                      borderTop: '2px solid transparent', 
                                      borderRadius: '50%',
                                      display: 'inline-block'
                                    }}></span>
                                    Analyzing submission...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={14} />
                                    Generate AI Suggestion
                                  </>
                                )}
                              </button>

                              {aiError && (
                                <div style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '2px' }}>
                                  ⚠️ {aiError}
                                </div>
                              )}
                            </div>
                          )}

                          {aiGeneratedTag && (
                            <div style={{ 
                              padding: '8px 12px', 
                              backgroundColor: 'rgba(10, 92, 54, 0.08)', 
                              border: '1px solid var(--primary)', 
                              borderRadius: 'var(--radius-sm)', 
                              fontSize: '0.75rem', 
                              color: 'var(--primary)', 
                              fontWeight: 'bold',
                              marginBottom: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <Sparkles size={14} />
                              <span>AI Suggestion Loaded. Review or modify before saving.</span>
                            </div>
                          )}

                          <form onSubmit={handleSaveGradeInline} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group" style={{ maxWidth: '200px', margin: 0 }}>
                              <label className="form-label">Score (Max: {selectedAssignmentForReview.maxScore})</label>
                              <input 
                                type="number" 
                                className="form-input" 
                                min="0" 
                                max={selectedAssignmentForReview.maxScore}
                                value={gradeScore}
                                onChange={e => {
                                  setGradeScore(e.target.value);
                                  setAiGeneratedTag(false);
                                }}
                                required
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Academic Feedback Comments</label>
                              <textarea 
                                className="form-textarea" 
                                placeholder="Write comments regarding code quality, formatting, schema correctness..."
                                value={gradeFeedback}
                                onChange={e => {
                                  setGradeFeedback(e.target.value);
                                  setAiGeneratedTag(false);
                                }}
                                style={{ minHeight: '80px' }}
                              />
                            </div>

                            {activeSubmission.isGroupSubmission && (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(223, 177, 25, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(223, 177, 25, 0.15)', fontSize: '0.75rem' }}>
                                <Users size={16} style={{ color: 'var(--secondary-hover)', flexShrink: 0 }} />
                                <span>
                                  <strong>Group Grade Sync Action</strong>: Saving will apply this score to all student members of <strong>{activeSubmission.groupName}</strong>.
                                </span>
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 16px', margin: 0 }}>
                                Save Grade & Feedback
                              </button>
                            </div>
                          </form>
                        </div>

                      </div>
                    );
                  })() : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center', minHeight: '400px' }}>
                      <Eye size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.7 }} />
                      <h4 style={{ color: 'var(--text-title)' }}>Online Document Previewer</h4>
                      <p style={{ maxWidth: '350px', fontSize: '0.85rem', marginTop: '6px' }}>
                        Select a student submission from the left panel. You can inspect their code files, slides, and reports directly on-screen without downloads.
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseCreateModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.3rem' }}>{editingAssignment ? 'Edit Assignment Sheet' : 'Publish Assignment Sheet'}</h3>
              <button className="modal-close" onClick={handleCloseCreateModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment}>
              <div className="form-group">
                <label className="form-label">Course Association</label>
                <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)}>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assignment Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Software Project Specification Draft" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                {errors.title && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Instructions / Description</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Describe requirements, upload standards, and grading rubric..." 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assignment Questions (Text)</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Type the assignment questions directly here..." 
                  value={questions}
                  onChange={e => setQuestions(e.target.value)}
                  style={{ minHeight: '100px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload Question Paper File (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <input 
                    type="file" 
                    id="question-file-upload" 
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setAttachmentFile(file);
                        setAttachmentName(file.name);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="question-file-upload" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0, color: 'black' }}>
                    <Upload size={14} />
                    Choose File
                  </label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachmentFile ? attachmentFile.name : (attachmentName || 'No file selected')}
                  </span>
                  {(attachmentFile || attachmentName) && (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline btn-danger" 
                      onClick={() => {
                        setAttachmentFile(null);
                        setAttachmentName('');
                      }}
                      style={{ padding: '2px 8px', height: '32px', color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Maximum Points</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1" 
                    value={maxScore}
                    onChange={e => setMaxScore(e.target.value)}
                  />
                  {errors.maxScore && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.maxScore}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date & Time</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                  {errors.dueDate && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.dueDate}</span>}
                </div>
              </div>

              {/* Assignment Type Switcher */}
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)' }}>
                <input 
                  type="checkbox" 
                  id="chk-group" 
                  checked={isGroup} 
                  onChange={e => setIsGroup(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label htmlFor="chk-group" style={{ fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                    Group Assignment Submission
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Students submit one file on behalf of their group, and grades synchronize.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={handleCloseCreateModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAssignment ? 'Save Changes' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Assignment Details Modal */}
      {viewingAssignmentDetails && (() => {
        const assign = viewingAssignmentDetails;
        const course = courses.find(c => c.id === assign.courseId || c.id === assign.course_id);
        const hasFile = assign.attachmentName || assign.attachment_name;
        
        return (
          <div className="modal-overlay" onClick={() => setViewingAssignmentDetails(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <div>
                  <span className="badge badge-primary">{course ? course.code : 'General'}</span>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '4px' }}>Assignment: {assign.title}</h3>
                </div>
                <button className="modal-close" onClick={() => setViewingAssignmentDetails(null)}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '14px' }}>
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Description & Instructions
                  </h4>
                  <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: '1.5', margin: 0, color: 'var(--text-main)' }}>
                    {assign.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Questions / Question Paper
                  </h4>
                  {assign.questions ? (
                    <div style={{ 
                      backgroundColor: 'var(--bg-app)', 
                      padding: '16px', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.5',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      marginBottom: hasFile ? '14px' : '0'
                    }}>
                      {assign.questions}
                    </div>
                  ) : (
                    !hasFile && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No text questions typed. Please check the attached document below.</p>
                  )}

                  {hasFile && (() => {
                    const fileName = assign.attachmentName || assign.attachment_name;
                    let fileUrl = '#';
                    if (isSupabaseConfigured) {
                      const storagePath = `questions_${assign.id}.${fileName.split('.').pop()}`;
                      const { data } = supabase.storage.from('submissions').getPublicUrl(storagePath);
                      fileUrl = data?.publicUrl || '#';
                    }
                    
                    return (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '12px 16px', 
                        backgroundColor: 'rgba(10, 92, 54, 0.05)', 
                        border: '1px dashed var(--primary)', 
                        borderRadius: 'var(--radius-md)',
                        marginTop: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.5rem' }}>📄</span>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--primary)' }}>{fileName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Question Paper Document</div>
                          </div>
                        </div>
                        {isSupabaseConfigured ? (
                          <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-primary btn-sm"
                            style={{ textDecoration: 'none', color: 'white' }}
                          >
                            Download File
                          </a>
                        ) : (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => alert(`Offline Mode Demo: Downloading document "${fileName}"`)}
                            style={{ color: 'white' }}
                          >
                            Download Mock
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Deadline: <strong style={{ color: 'var(--color-warning)' }}>{assign.dueDate || assign.due_date}</strong></span>
                  <span>Maximum Points: <strong>{assign.maxScore || assign.max_score}</strong></span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
