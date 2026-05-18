import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const API = 'http://localhost:5000/api/notes';

function App() {
  const [notes, setNotes]           = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [title, setTitle]           = useState('');
  const [body, setBody]             = useState('');
  const [tags, setTags]             = useState('');
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast]           = useState('');

  // ── FETCH NOTES ──────────────────────────────────────────
  useEffect(() => {
  fetchNotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [filter, search]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(API, {
        params: { filter, q: search }
      });
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ── SHOW TOAST ───────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // ── CREATE NOTE ──────────────────────────────────────────
  const createNote = async () => {
    try {
      const res = await axios.post(API, {
        title: 'Untitled',
        body: '',
        tags: [],
        pinned: false,
        archived: false
      });
      setNotes([res.data, ...notes]);
      openNote(res.data);
      showToast('New note created ✦');
    } catch (err) {
      console.error(err);
    }
  };

  // ── OPEN NOTE ────────────────────────────────────────────
  const openNote = (note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setBody(note.body);
    setTags(note.tags.join(', '));
  };

  // ── SAVE NOTE ────────────────────────────────────────────
  const saveNote = async () => {
    if (!currentNote) return;
    try {
      const updated = {
        title: title || 'Untitled',
        body,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
      };
      const res = await axios.put(`${API}/${currentNote._id}`, updated);
      setCurrentNote(res.data);
      fetchNotes();
      showToast('Note saved ✓');
    } catch (err) {
      console.error(err);
    }
  };

  // ── PIN NOTE ─────────────────────────────────────────────
  const pinNote = async () => {
    if (!currentNote) return;
    try {
      const res = await axios.put(`${API}/${currentNote._id}`, {
        pinned: !currentNote.pinned
      });
      setCurrentNote(res.data);
      fetchNotes();
      showToast(res.data.pinned ? '📌 Note pinned' : 'Note unpinned');
    } catch (err) {
      console.error(err);
    }
  };

  // ── ARCHIVE NOTE ─────────────────────────────────────────
  const archiveNote = async () => {
    if (!currentNote) return;
    try {
      const res = await axios.put(`${API}/${currentNote._id}`, {
        archived: !currentNote.archived
      });
      setCurrentNote(null);
      fetchNotes();
      showToast(res.data.archived ? '🗂 Note archived' : 'Note unarchived');
    } catch (err) {
      console.error(err);
    }
  };

  // ── DELETE NOTE ──────────────────────────────────────────
  const deleteNote = async () => {
    if (!currentNote) return;
    try {
      await axios.delete(`${API}/${currentNote._id}`);
      setCurrentNote(null);
      setShowDelete(false);
      fetchNotes();
      showToast('Note deleted 🗑');
    } catch (err) {
      console.error(err);
    }
  };

  // ── FORMAT DATE ──────────────────────────────────────────
  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="app-shell">

      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <div className="sidebar-header">
          <span className="logo-mark">✦</span>
          <span className="logo-text">Noteflow</span>
        </div>

        <div className="px-3 pb-2">
          <button className="btn-new w-100" onClick={createNote}>
            + New Note
          </button>
        </div>

        <div className="px-3 pb-2">
          <input
            type="text"
            className="search-input w-100"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="px-3 pb-2">
          {['all', 'pinned', 'archived'].map(f => (
            <button
              key={f}
              className={`filter-btn w-100 ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '📋 All Notes' : f === 'pinned' ? '📌 Pinned' : '🗂 Archived'}
            </button>
          ))}
        </div>

        <div className="notes-list">
          {notes.length === 0 && (
            <p className="text-center text-muted mt-4" style={{ fontSize: 13 }}>
              No notes found
            </p>
          )}
          {notes.map(note => (
            <div
              key={note._id}
              className={`note-item ${currentNote?._id === note._id ? 'active' : ''}`}
              onClick={() => openNote(note)}
            >
              <div className="note-item-title">
                {note.pinned && '📌 '}{note.title || 'Untitled'}
              </div>
              <div className="note-item-preview">
                {note.body.slice(0, 60) || 'Empty note...'}
              </div>
              <div className="note-item-date">{formatDate(note.updatedAt)}</div>
              {note.tags.length > 0 && (
                <div className="note-item-tags">
                  {note.tags.map((t, i) => (
                    <span key={i} className="tag-pill">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="avatar">A</div>
          <div>
            <div className="user-name">Admin User</div>
            <div className="user-role">Free Plan</div>
          </div>
        </div>
      </div>

      {/* ── EDITOR ── */}
      <div className="editor-area">

        {/* Toolbar */}
        <div className="editor-toolbar">
          <div className="d-flex align-items-center gap-2">
            <span className="note-date">
              {currentNote ? formatDate(currentNote.updatedAt) : '—'}
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="tool-btn" onClick={pinNote}    title="Pin">📌</button>
            <button className="tool-btn" onClick={archiveNote} title="Archive">🗂</button>
            <button className="tool-btn danger" onClick={() => setShowDelete(true)} title="Delete">🗑</button>
            <button className="btn-save" onClick={saveNote}>Save</button>
          </div>
        </div>

        {/* Editor Content */}
        {!currentNote ? (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <h2>Nothing selected</h2>
            <p>Pick a note from the list, or create a new one.</p>
            <button className="btn-new-lg" onClick={createNote}>
              Create your first note
            </button>
          </div>
        ) : (
          <div className="note-editor">
            <input
              type="text"
              className="note-title-input"
              placeholder="Untitled Note..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <div className="tag-row">
              <input
                type="text"
                className="tag-input"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>
            <textarea
              className="editor-body"
              placeholder="Start writing... your ideas live here."
              value={body}
              onChange={e => setBody(e.target.value)}
            />
            <div className="word-count">
              {body.trim() ? body.trim().split(/\s+/).length : 0} words
            </div>
          </div>
        )}
      </div>

      {/* ── DELETE MODAL ── */}
      {showDelete && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon">⚠️</div>
            <h5>Delete this note?</h5>
            <p>This action cannot be undone.</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-secondary btn-sm"
                onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn btn-danger btn-sm"
                onClick={deleteNote}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && <div className="toast-msg">{toast}</div>}

    </div>
  );
}

export default App;