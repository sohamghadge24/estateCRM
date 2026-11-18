import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';
import { AddAppointmentModal } from './AddAppointmentModal';

export const AppointmentsPanel = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('MONTH'); // 'MONTH' | 'WEEK' | 'DAY' | 'AGENDA'
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | 'SHARED' | 'PUBLIC' | 'SITE_VISIT'
  const [search, setSearch] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 10)); // November 2026
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    await api.updateAppointment(id, { status });
    fetchAppointments();
    if (selectedApt?.id === id) setSelectedApt(prev => ({ ...prev, status }));
  };

  const handleSaveFeedback = async (id) => {
    if (!feedbackNote.trim()) return;
    await api.updateAppointment(id, {
      notes: selectedApt.notes ? `${selectedApt.notes} | Feedback: ${feedbackNote}` : `Feedback: ${feedbackNote}`,
      status: 'COMPLETED',
    });
    setFeedbackNote('');
    fetchAppointments();
    setSelectedApt(null);
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToday = () => {
    setCurrentDate(new Date(2026, 10, 10));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const curMonthName = monthNames[currentDate.getMonth()];
  const curYear = currentDate.getFullYear();

  // Color mapping based on event category/type (matching Untitled UI screenshot)
  const getEventBadgeStyle = (apt) => {
    if (apt.type === 'SITE_VISIT') {
      return { bg: '#FFEFE6', color: '#EB5E28', border: '#FAD2C0' }; // Orange / Peach
    }
    if (apt.type === 'CLIENT_MEETING') {
      return { bg: '#EDE7F6', color: '#5E35B1', border: '#D1C4E9' }; // Lavender / Purple
    }
    if (apt.status === 'COMPLETED') {
      return { bg: '#E8F5E9', color: '#2E7D32', border: '#C8E6C9' }; // Green
    }
    return { bg: '#E3F2FD', color: '#1565C0', border: '#BBDEFB' }; // Blue
  };

  // Filtered list
  const filtered = appointments.filter(a => {
    const matchesSearch =
      (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.clientName || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.propertyTitle || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'ALL' ? true :
      categoryFilter === 'SITE_VISIT' ? a.type === 'SITE_VISIT' : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="crm-panel-container">
      {/* ── 1. Untitled UI Inspired Calendar Top Header ── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 14,
        border: '1px solid var(--color-border)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 20,
      }}>
        {/* Top line with title and category pill tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
          <div>
            <span className="eyebrow">FIELD DUTY & WORKFORCE CALENDAR</span>
            <h1 style={{
              fontSize: 'var(--font-size-page-heading, 26px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              color: 'var(--color-text-primary)',
              margin: '2px 0 0 0',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.02em',
            }}>
              Calendar & Site Visits
            </h1>
          </div>

          {/* Sub-view filter tabs (All events, Shared, Public, Site Visits) */}
          <div style={{ display: 'flex', gap: 4, background: '#F8F7F4', padding: 3, borderRadius: 8, border: '1px solid var(--color-border)' }}>
            {[
              { id: 'ALL', label: 'All events' },
              { id: 'SITE_VISIT', label: 'Site visits' },
              { id: 'SHARED', label: 'Client meetings' },
              { id: 'PUBLIC', label: 'Team follow-ups' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                style={{
                  height: 30,
                  padding: '0 12px',
                  borderRadius: 6,
                  background: categoryFilter === tab.id ? '#FFFFFF' : 'transparent',
                  color: categoryFilter === tab.id ? 'var(--color-text-primary)' : 'var(--color-muted)',
                  fontSize: 11,
                  fontWeight: categoryFilter === tab.id ? 700 : 500,
                  boxShadow: categoryFilter === tab.id ? '0 1px 3px rgba(37,36,34,0.08)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls row (Month display, search, chevrons, Today, View selector, Add Event) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 16,
          borderTop: '1px solid #f0ede7',
        }}>
          {/* Month & Date Range display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: '#252422',
              color: '#FFFFFF',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 600,
              fontSize: 15,
              fontFamily: 'var(--font-sans)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              10
            </div>
            <div>
              <strong style={{ fontSize: 'var(--font-size-section-heading, 17px)', color: 'var(--color-text-primary)', display: 'block', fontFamily: 'var(--font-sans)', fontWeight: 'var(--font-weight-semibold, 600)', letterSpacing: '-0.015em' }}>
                {curMonthName} {curYear}
              </strong>
              <small style={{ color: 'var(--color-muted)', fontSize: 11 }}>
                Nov 1, {curYear} – Nov 30, {curYear}
              </small>
            </div>
          </div>

          {/* Center search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 240px', maxWidth: 320 }}>
            <div className="lead-search" style={{ width: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 10, top: 9, color: 'var(--color-muted)' }}>
                <Icon name="search" size={14} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search appointments..."
                style={{
                  width: '100%',
                  height: 34,
                  padding: '0 12px 0 32px',
                  borderRadius: 7,
                  border: '1px solid var(--color-border)',
                  fontSize: 12,
                  background: '#FAF9F6',
                }}
              />
            </div>
          </div>

          {/* Controls: Nav chevrons, Today, View selector, Add CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'inline-flex', border: '1px solid var(--color-border)', borderRadius: 7, overflow: 'hidden' }}>
              <button
                onClick={prevMonth}
                style={{ width: 32, height: 32, background: 'white', display: 'grid', placeItems: 'center', color: 'var(--color-text-secondary)' }}
                aria-label="Previous month"
              >
                ←
              </button>
              <button
                onClick={goToday}
                style={{ padding: '0 10px', height: 32, background: 'white', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)' }}
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                style={{ width: 32, height: 32, background: 'white', display: 'grid', placeItems: 'center', color: 'var(--color-text-secondary)' }}
                aria-label="Next month"
              >
                →
              </button>
            </div>

            {/* View Selector Dropdown */}
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              style={{
                height: 34,
                padding: '0 10px',
                borderRadius: 7,
                border: '1px solid var(--color-border)',
                background: 'white',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="MONTH">Month view</option>
              <option value="WEEK">Week view</option>
              <option value="DAY">Day view</option>
              <option value="AGENDA">Agenda view</option>
            </select>

            {/* Add Event Button */}
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                height: 34,
                padding: '0 14px',
                borderRadius: 7,
                background: '#252422',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name="plus" size={14} />
              <span>+ Add event</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Full Month Calendar Grid (Untitled UI reference) ── */}
      {viewMode === 'MONTH' ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Weekday headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid var(--color-border)',
            background: '#FAF9F6',
          }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={idx} style={{
                padding: '12px 14px',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-muted)',
                textAlign: 'left',
                borderRight: idx < 6 ? '1px solid #f0ede7' : 'none',
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* 35 Calendar Cells (5 weeks x 7 days) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
          }}>
            {Array.from({ length: 35 }).map((_, i) => {
              // Day calculation (Nov 2026 starts on Sunday = day 7, so Nov 1 is Sun)
              // We'll arrange 30 days of November
              const dayNumber = i - 5; // offset
              const isCurrentMonth = dayNumber >= 1 && dayNumber <= 30;
              const displayDay = isCurrentMonth ? dayNumber : (dayNumber < 1 ? 31 + dayNumber : dayNumber - 30);
              const dateStr = `2026-11-${displayDay < 10 ? '0' + displayDay : displayDay}`;
              const isToday = isCurrentMonth && displayDay === 10;

              // Filter appointments for this date
              const dayApts = isCurrentMonth
                ? filtered.filter(a => a.date === dateStr)
                : [];

              return (
                <div key={i} style={{
                  minHeight: 110,
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid #F0EDE7' : 'none',
                  borderBottom: '1px solid #F0EDE7',
                  padding: '8px 8px',
                  background: isCurrentMonth ? '#FFFFFF' : '#FCFBF9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  opacity: isCurrentMonth ? 1 : 0.45,
                }}>
                  {/* Day header number with active circle for today */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    {isToday ? (
                      <span style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: '#252422',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: 11,
                        display: 'grid',
                        placeItems: 'center',
                      }}>
                        {displayDay}
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isCurrentMonth ? 'var(--color-text-primary)' : 'var(--color-muted)',
                      }}>
                        {displayDay}
                      </span>
                    )}
                  </div>

                  {/* Event pills inside day cell */}
                  {dayApts.map(apt => {
                    const style = getEventBadgeStyle(apt);
                    return (
                      <div
                        key={apt.id}
                        onClick={() => setSelectedApt(apt)}
                        style={{
                          padding: '3px 6px',
                          borderRadius: 5,
                          background: style.bg,
                          color: style.color,
                          border: `1px solid ${style.border}`,
                          fontSize: 10,
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        title={`${apt.title} at ${apt.time}`}
                      >
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: style.color, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {apt.title} • {apt.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda / Table View */
        <div className="lead-table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Activity Title</th>
                <th>Category</th>
                <th>Client / Contact</th>
                <th>Target Asset / Location</th>
                <th>Date & Time</th>
                <th>Assigned Broker</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(apt => {
                const style = getEventBadgeStyle(apt);
                return (
                  <tr key={apt.id}>
                    <td className="lead-name-cell">
                      <button className="lead-name-button" onClick={() => setSelectedApt(apt)}>
                        {apt.title}
                      </button>
                      <small>{apt.location || 'Location on request'}</small>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 99,
                        background: style.bg,
                        color: style.color,
                        border: `1px solid ${style.border}`,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}>
                        {apt.type.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td><strong>{apt.clientName}</strong></td>
                    <td>{apt.propertyTitle || '—'}</td>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>
                        {apt.date} @ {apt.time}
                      </strong>
                    </td>
                    <td>{apt.assignedAgent}</td>
                    <td>
                      <span className={`status-pill ${
                        apt.status === 'COMPLETED' ? 'status-converted' : 'status-site-visit'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedApt(apt)}
                        style={{ padding: '4px 10px', borderRadius: 6, background: '#f7f5f0', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}
                      >
                        Inspect / Notes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Event Detail & Feedback Outcome Drawer ── */}
      {selectedApt && (
        <div className="dialog-backdrop" onClick={() => setSelectedApt(null)}>
          <div className="lead-detail-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <header>
              <div>
                <span className="eyebrow">APPOINTMENT DOSSIER & FEEDBACK</span>
                <h2>{selectedApt.title}</h2>
                <span className="lead-id">{selectedApt.date} at {selectedApt.time} • {selectedApt.location}</span>
              </div>
              <button className="icon-action" onClick={() => setSelectedApt(null)}>
                <Icon name="x" size={16} />
              </button>
            </header>

            <div className="detail-grid">
              <div>
                <span>Client / Contact</span>
                <strong>{selectedApt.clientName}</strong>
              </div>
              <div>
                <span>Related Property Asset</span>
                <strong>{selectedApt.propertyTitle || 'General Consultation'}</strong>
              </div>
              <div>
                <span>Assigned Agent</span>
                <strong>{selectedApt.assignedAgent}</strong>
              </div>
              <div>
                <span>Current Status</span>
                <span className="status-pill status-qualified" style={{ alignSelf: 'flex-start' }}>{selectedApt.status}</span>
              </div>
            </div>

            {selectedApt.notes && (
              <div className="detail-notes" style={{ marginBottom: 16 }}>
                <span>Scheduled Objectives:</span>
                <p>{selectedApt.notes}</p>
              </div>
            )}

            <div style={{ padding: '14px', borderRadius: 8, background: '#F8F7F4', border: '1px solid var(--color-border)' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Record Client Inspection Feedback & Outcome
              </label>
              <textarea
                rows={3}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Client feedback on price, layout, specifications, or next follow-up required..."
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 12, background: 'white' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                {selectedApt.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleSaveFeedback(selectedApt.id)}
                    style={{
                      height: 32,
                      padding: '0 14px',
                      borderRadius: 6,
                      background: 'var(--color-primary)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  >
                    Save Feedback & Complete Event
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AddAppointmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setShowAddModal(false); fetchAppointments(); }}
      />
    </div>
  );
};
