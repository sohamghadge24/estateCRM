import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';

const TEMPLATES = [
  {
    id: 'tpl_01',
    name: 'Lead Acknowledgement',
    channel: 'WHATSAPP',
    text: 'Dear {{name}}, thank you for reaching out to Apex Horizon Capital regarding {{property}}. One of our senior advisors will connect with you shortly.',
  },
  {
    id: 'tpl_02',
    name: 'Site Visit Confirmation',
    channel: 'WHATSAPP',
    text: 'Dear {{name}}, confirming your private site viewing for {{property}} on {{date}} at {{time}}. Location: {{location}}.',
  },
  {
    id: 'tpl_03',
    name: 'Agreement Draft Review',
    channel: 'EMAIL',
    text: 'Dear {{name}}, please find attached the reviewed acquisition agreement draft for {{property}}. Kindly review clauses 4 & 7 regarding payment schedule.',
  },
  {
    id: 'tpl_04',
    name: 'Token Advance Reminder',
    channel: 'SMS',
    text: 'Apex Horizon Alert: Token booking advance of {{amount}} is scheduled for clearing for {{property}}. Ref: TXN-{{id}}.',
  },
];

export const CommunicationsPanel = () => {
  const [comms, setComms] = useState([]);
  const [channelTab, setChannelTab] = useState('ALL'); // 'ALL' | 'WHATSAPP' | 'EMAIL' | 'SMS'
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('WHATSAPP');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchComms = async () => {
    const data = await api.getCommunications();
    setComms(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchComms();
  }, []);

  const handleTemplateSelect = (e) => {
    const tplId = e.target.value;
    setSelectedTemplate(tplId);
    const tpl = TEMPLATES.find(t => t.id === tplId);
    if (tpl) {
      setContent(tpl.text);
      setChannel(tpl.channel);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipient.trim() || !content.trim()) {
      alert('Please specify recipient and message content');
      return;
    }
    setSending(true);
    try {
      await api.sendCommunication({
        channel,
        recipient,
        template: selectedTemplate ? TEMPLATES.find(t => t.id === selectedTemplate)?.name : 'Custom Message',
        content,
      });
      setFeedback('Message successfully dispatched via verified provider adapter!');
      setRecipient('');
      setContent('');
      setSelectedTemplate('');
      fetchComms();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(`Send error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const filtered = comms.filter(c => {
    if (channelTab === 'ALL') return true;
    return c.channel === channelTab;
  });

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">OMNICHANNEL OUTREACH</span>
          <h1 className="dashboard-title">COMMUNICATIONS & TEMPLATES</h1>
          <p className="dashboard-subtitle">
            Automated WhatsApp Business, Transactional Email, and SMS provider messaging logs.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20, alignItems: 'start' }}>
        {/* ── Left Column: Compose & Dispatch ── */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          padding: 22,
          boxShadow: 'var(--shadow-card)',
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Direct Client Message Composer
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 18 }}>
            Dispatches via Twilio SMS, WhatsApp Cloud API, or SendGrid Email adapter.
          </p>

          {feedback && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
              {feedback}
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Delivery Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 12 }}
                >
                  <option value="WHATSAPP">WhatsApp Cloud API (Meta Verified)</option>
                  <option value="EMAIL">Email (SendGrid / AWS SES)</option>
                  <option value="SMS">SMS (Twilio / Gupshup)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Approved Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={handleTemplateSelect}
                  style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 12 }}
                >
                  <option value="">-- Custom Message (No Template) --</option>
                  {TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Recipient Address / Phone E.164 *
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={channel === 'EMAIL' ? 'client@domain.com' : '+91 98200 99881'}
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Message Content *
              </label>
              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13, lineHeight: 1.5 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={sending}
                style={{
                  height: 38,
                  padding: '0 20px',
                  borderRadius: 7,
                  background: 'var(--color-primary)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="send" size={15} />
                <span>{sending ? 'Sending...' : 'Transmit Message'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ── Right Column: Transmission History & Logs ── */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          padding: 22,
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Outreach Log Stream
            </h3>
            <div style={{ display: 'flex', gap: 4 }}>
              {['ALL', 'WHATSAPP', 'EMAIL', 'SMS'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setChannelTab(tab)}
                  style={{
                    height: 24,
                    padding: '0 8px',
                    borderRadius: 4,
                    background: channelTab === tab ? 'var(--color-text-primary)' : '#f0ede7',
                    color: channelTab === tab ? 'white' : 'var(--color-text-secondary)',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 420, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <p style={{ color: 'var(--color-muted)', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>
                No communication history found.
              </p>
            ) : (
              filtered.map(c => (
                <div key={c.id} style={{
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #f0ede7',
                  background: '#FAF9F6',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span className="status-pill status-contacted" style={{ fontSize: 9 }}>
                      {c.channel}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <strong style={{ fontSize: 12, color: 'var(--color-text-primary)', display: 'block', marginBottom: 2 }}>
                    To: {c.recipient}
                  </strong>
                  <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                    {c.content}
                  </p>
                  <span className="status-pill status-converted" style={{ fontSize: 9 }}>
                    ✓ {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

