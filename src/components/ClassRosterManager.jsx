import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Clipboard, 
  UserCheck, 
  AlertCircle, 
  Sparkles,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function ClassRosterManager({ users, onImportStudents }) {
  const [csvFile, setCsvFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [parsedStudents, setParsedStudents] = useState([]);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle parsing initials from name
  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0] || '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ST';
  };

  // CSV/Text Row Parser - Handles variable column ordering & serial numbers
  const parseRows = (text) => {
    const lines = text.split('\n');
    const result = [];
    let lineNum = 0;

    for (let line of lines) {
      lineNum++;
      const cleanLine = line.trim();
      if (!cleanLine) continue;

      // Split by comma or semicolon
      const parts = cleanLine.split(/[;,]/).map(p => p.trim());
      
      // Determine if this is a header row
      const isHeader = parts.some(p => {
        const lp = p.toLowerCase();
        return lp === 'name' || 
               lp === 'student name' || 
               lp === 'student_name' ||
               lp.includes('reg') || 
               lp.includes('matric') || 
               lp === 's/n' || 
               lp === 'sn' || 
               lp === 'no' || 
               lp === 'id';
      });

      if (isHeader) continue;

      // Extract active parts after stripping serial number if present as a column
      let activeParts = [...parts];
      if (activeParts.length >= 3) {
        const firstPart = activeParts[0].toLowerCase();
        const isSerial = /^\d+$/.test(firstPart) || 
                         firstPart === 's/n' || 
                         firstPart === 'sn' || 
                         firstPart === 'no' || 
                         firstPart === 'id' || 
                         firstPart === 's.n' || 
                         firstPart === 's.n.';
        
        if (isSerial) {
          activeParts.shift(); // Remove serial number column
        }
      }

      if (activeParts.length < 2) {
        continue; // Skip incomplete rows silently
      }

      // Detect which column is the registration number vs student name.
      // Heuristic: Registration numbers usually contain slashes, hyphens, or numbers.
      const looksLikeRegNo = (str) => {
        return str.includes('/') || str.includes('-') || /\d/.test(str);
      };

      let rawName = '';
      let rawRegNo = '';

      const part0Reg = looksLikeRegNo(activeParts[0]);
      const part1Reg = looksLikeRegNo(activeParts[1]);

      if (part0Reg && !part1Reg) {
        // Format: RegistrationNo, Name
        rawRegNo = activeParts[0];
        rawName = activeParts[1];
      } else if (!part0Reg && part1Reg) {
        // Format: Name, RegistrationNo
        rawName = activeParts[0];
        rawRegNo = activeParts[1];
      } else {
        // Default fallback: Name first, then Registration Number
        rawName = activeParts[0];
        rawRegNo = activeParts[1];
      }

      // Strip any serial number prefix from name (e.g., "1. Haruna" or "1 - Haruna" or "1 Haruna")
      let name = rawName.replace(/^\d+[\s.-]+/, '').trim();
      name = name.replace(/^\d+\s+/, '').trim();

      // Strip any serial number prefix from registration number as well just in case (e.g., "1. FUD/CSC/22/1001")
      let regNo = rawRegNo.replace(/^\d+[\s.-]+/, '').trim();
      regNo = regNo.replace(/^\d+\s+/, '').trim();

      // Basic validation
      if (!name) {
        throw new Error(`Line ${lineNum}: Name cannot be empty.`);
      }
      if (!regNo) {
        throw new Error(`Line ${lineNum}: Registration number cannot be empty.`);
      }

      // "for email just save thier registration nuumbers instead of emails"
      const email = regNo;

      // Check if email already registered in existing system
      const isExisting = users.some(u => u.email.toLowerCase() === email.toLowerCase() || u.id === `student_${regNo.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);

      // Generate a unique ID based on the registration number
      const generatedId = `student_${regNo.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      result.push({
        id: generatedId,
        name: name,
        email: email, // Registration number saved directly in email field!
        role: 'student',
        avatar: getInitials(name),
        password: 'password123',
        is_first_login: true,
        isExisting: isExisting,
        regNo: regNo
      });
    }

    if (result.length === 0) {
      throw new Error('No students detected. Please check your data.');
    }

    return result;
  };

  // CSV File reader
  const handleFileUpload = (e) => {
    setErrorMsg('');
    setSuccessMsg('');
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const parsed = parseRows(text);
        setParsedStudents(parsed);
      } catch (err) {
        setErrorMsg(err.message);
        setParsedStudents([]);
        setCsvFile(null);
      }
    };
    reader.readAsText(file);
  };

  // Paste Text Parser
  const handleParsePasted = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!pastedText.trim()) {
      setErrorMsg('Please paste student list details first.');
      return;
    }

    try {
      const parsed = parseRows(pastedText);
      setParsedStudents(parsed);
    } catch (err) {
      setErrorMsg(err.message);
      setParsedStudents([]);
    }
  };

  // Import Submission
  const handleCommitImport = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    
    // Filter out students that already exist
    const newStudents = parsedStudents.filter(s => !s.isExisting);
    
    if (newStudents.length === 0) {
      setErrorMsg('All parsed students are already registered in the system.');
      return;
    }

    try {
      // Include password and is_first_login columns
      const cleanImportData = newStudents.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        role: s.role,
        avatar: s.avatar,
        password: s.password,
        is_first_login: s.is_first_login
      }));

      await onImportStudents(cleanImportData);
      
      setSuccessMsg(`Successfully imported ${cleanImportData.length} students into the assessment system!`);
      setParsedStudents([]);
      setPastedText('');
      setCsvFile(null);
    } catch (err) {
      setErrorMsg(err.message || 'Import failed. Check database logs.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Introduction Card */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(10, 92, 54, 0.03) 0%, rgba(223, 177, 25, 0.03) 100%)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '10px', borderRadius: 'var(--radius-md)' }}>
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-title)', marginBottom: '6px' }}>
              Bulk Student Class List Uploader
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Register new students to the assessment system in bulk. Once imported, these students can log in, take quizzes, and be assigned to Group Circles in your courses.
            </p>
          </div>
        </div>
      </div>

      {/* Upload/Paste Form Split Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Side: File Upload */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--primary)' }}>
              <Upload size={18} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>Option 1: Upload CSV Roster File</h3>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
              Upload a standard `.csv` file exported from Excel or your Registry. The CSV should contain columns for student Name and Registration Number (separated by commas).
            </p>
            
            {/* Custom File Upload Area */}
            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '30px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-app)',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <FileSpreadsheet size={32} style={{ color: 'var(--primary)', opacity: 0.7, marginBottom: '10px' }} />
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-title)' }}>
                {csvFile ? csvFile.name : 'Select Class Roster CSV File'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Only .csv files supported
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <HelpCircle size={14} />
            <span>Format: <code>[S/N], Student Name, RegistrationNo</code> (Serial number prefix supported)</span>
          </div>
        </div>

        {/* Right Side: Paste Text */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--primary)' }}>
              <Clipboard size={18} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>Option 2: Copy & Paste Student List</h3>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.4' }}>
              Paste comma-separated student names and registration numbers directly in the field below. Put each student on a separate line.
            </p>

            <textarea 
              className="form-input"
              rows={4}
              placeholder="e.g.&#10;Haruna Usman, FUD/CSC/22/1001&#10;Aisha Bello, FUD/CSC/22/1002"
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              style={{ width: '100%', resize: 'none', fontSize: '0.85rem', fontFamily: 'monospace', padding: '10px' }}
            />
          </div>

          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={handleParsePasted}
            style={{ width: '100%', marginTop: '14px' }}
          >
            Parse Pasted Student List
          </button>
        </div>

      </div>

      {/* Feedback messages */}
      {errorMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(220, 38, 38, 0.08)',
          border: '1px solid rgba(220, 38, 38, 0.15)',
          color: 'var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          fontWeight: '600'
        }}>
          <AlertCircle size={18} />
          <span>Error: {errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(22, 163, 74, 0.08)',
          border: '1px solid rgba(22, 163, 74, 0.15)',
          color: 'var(--primary)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          fontWeight: '600'
        }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Parse Roster Preview */}
      {parsedStudents.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <UserCheck size={20} />
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                Parsed Student List Preview ({parsedStudents.length} entries)
              </h3>
            </div>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleCommitImport}
            >
              <Sparkles size={16} />
              Confirm Bulk Import to Database
            </button>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Avatar</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Parsed Name</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Parsed Email</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Suggested ID</th>
                  <th style={{ textAlign: 'center', padding: '10px' }}>Status Check</th>
                </tr>
              </thead>
              <tbody>
                {parsedStudents.map((s, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px' }}>
                      <div className="user-avatar" style={{ margin: 0, width: '28px', height: '28px', fontSize: '0.75rem' }}>
                        {s.avatar}
                      </div>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{s.name}</td>
                    <td style={{ padding: '10px', fontSize: '0.85rem' }}>{s.email}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.id}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {s.isExisting ? (
                        <span style={{
                          padding: '3px 8px',
                          backgroundColor: 'rgba(234, 88, 12, 0.1)',
                          color: 'var(--color-warning)',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: '700'
                        }}>
                          Already Exists (Will Skip)
                        </span>
                      ) : (
                        <span style={{
                          padding: '3px 8px',
                          backgroundColor: 'rgba(22, 163, 74, 0.1)',
                          color: 'var(--primary)',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: '700'
                        }}>
                          Ready to Import
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
