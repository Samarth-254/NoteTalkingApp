'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    fetchNotes();
  }, [router]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/api/notes');
      setNotes(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setFormError('Title is required');
      return;
    }
    if (trimmedTitle.length > 100) {
      setFormError('Title must be at most 100 characters');
      return;
    }
    if (!trimmedContent) {
      setFormError('Content is required');
      return;
    }
    if (trimmedContent.length > 5000) {
      setFormError('Content must be at most 5000 characters');
      return;
    }

    setCreating(true);
    try {
      const newNote = await api.post('/api/notes', {
        title: trimmedTitle,
        content: trimmedContent,
      });
      setNotes([newNote, ...notes]);
      setTitle('');
      setContent('');
    } catch (err) {
      setFormError(err.message || 'Failed to create note');
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setEditError('');
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    setEditError('');

    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedTitle) {
      setEditError('Title is required');
      return;
    }
    if (trimmedTitle.length > 100) {
      setEditError('Title must be at most 100 characters');
      return;
    }
    if (!trimmedContent) {
      setEditError('Content is required');
      return;
    }
    if (trimmedContent.length > 5000) {
      setEditError('Content must be at most 5000 characters');
      return;
    }

    setEditLoading(true);
    try {
      const updated = await api.put(`/api/notes/${editingId}`, {
        title: trimmedTitle,
        content: trimmedContent,
      });

      setNotes(notes.map((n) => (n.id === editingId ? updated : n)));
      cancelEditing();
    } catch (err) {
      setEditError(err.message || 'Failed to update note');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;

    try {
      await api.delete(`/api/notes/${id}`);
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete note');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-8">
        <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Add a New Note</h2>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateNote} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Title (1-100 characters)"
                maxLength={100}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <textarea
                placeholder="Write your note here... (1-5000 characters)"
                maxLength={5000}
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
              >
                {creating ? 'Saving...' : 'Add Note'}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Notes</h2>
            <span className="text-xs text-gray-500 font-medium">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>

          {loading && (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-500 text-sm">Loading your notes...</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          {!loading && !error && notes.length === 0 && (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-500 text-base font-medium">No notes yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Create your first note above to get started.
              </p>
            </div>
          )}

          {!loading && notes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between"
                >
                  {editingId === note.id ? (
                    <form onSubmit={handleUpdateNote} className="space-y-3">
                      {editError && (
                        <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                          {editError}
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <textarea
                          rows={4}
                          required
                          maxLength={5000}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={editLoading}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded text-xs font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={editLoading}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium disabled:opacity-50"
                        >
                          {editLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base mb-2 break-words">
                          {note.title}
                        </h3>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                          {note.content}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {new Date(note.updated_at || note.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(note)}
                            className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
