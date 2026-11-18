import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../common/Icons';

/* ── 1. Dashboard Header Component (ROW 1) ── */
export const DashboardHeader = ({ onOpenAddProperty, onOpenAddLead, onRefresh, refreshing }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
    <div>
      <h1 style={{ fontSize: 'var(--font-size-page-heading, 26px)', fontWeight: 600, color: 'var(--color-text-primary, #252422)', margin: 0, fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>
        Dashboard
      </h1>
      <p style={{ fontSize: 'var(--font-size-secondary, 12.5px)', fontWeight: 400, color: 'var(--color-text-secondary, #524E48)', margin: '3px 0 0 0', fontFamily: 'var(--font-sans)' }}>
        Plan, prioritize, and accomplish your property mandates with ease.
      </p>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        onClick={onRefresh}
        style={{
          width: 36,
          height: 36,
          borderRadius: 99,
          border: '1px solid rgba(0,0,0,0.08)',
          background: '#FFFFFF',
          color: 'var(--color-text-secondary, #524E48)',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 140ms ease',
        }}
        title="Refresh dashboard metrics"
        aria-label="Refresh dashboard metrics"
      >
        <Icon name="refreshCw" size={13} className={refreshing ? 'animate-spin' : ''} />
      </button>

      <button
        onClick={onOpenAddProperty}
        style={{
          height: 36,
          padding: '0 16px',
          borderRadius: 99,
          background: 'linear-gradient(135deg, #EB5E28 0%, #D44E1C 100%)',
          color: '#FFFFFF',
          fontSize: 'var(--font-size-button, 13px)',
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(235, 94, 40, 0.28)',
          transition: 'transform 120ms ease, box-shadow 120ms ease',
        }}
      >
        <Icon name="plus" size={13} />
        <span>Add Property</span>
      </button>

      <button
        onClick={onOpenAddLead}
        style={{
          height: 36,
          padding: '0 16px',
          borderRadius: 99,
          background: '#FFFFFF',
          color: 'var(--color-text-primary, #252422)',
          fontSize: 'var(--font-size-button, 13px)',
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          border: '1px solid rgba(0,0,0,0.08)',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 120ms ease',
        }}
      >
        <Icon name="users" size={13} style={{ color: '#89847C' }} />
        <span>Create Lead</span>
      </button>
    </div>
  </div>
);

/* ── 2. Dashboard Stats Component (ROW 2 - 4 Equal KPI Cards) ── */
export const DashboardStats = ({ propertiesCount = 0, leadsCount = 0, activeDealsCount = 0, closedRevenue = 0, formatCurrency, onNavigate }) => (
  <div
    className="donezo-kpi-grid"
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '16px',
      width: '100%',
      marginBottom: '16px',
    }}
  >
    {/* Card 1: Total Properties (Orange Gradient Background) */}
    <div
      onClick={() => onNavigate('properties')}
      className="donezo-kpi-card donezo-kpi-orange"
      style={{
        background: 'linear-gradient(135deg, #EB5E28 0%, #D44E1C 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '18px',
        padding: '18px 20px',
        minHeight: '125px',
        maxHeight: '145px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        boxShadow: '0 4px 18px -2px rgba(235, 94, 40, 0.28), 0 2px 6px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 'var(--font-size-card-heading, 15px)', fontWeight: 600, color: 'rgba(255,255,255,0.95)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em' }}>
          Total Properties
        </span>
        <div
          className="donezo-circle-btn donezo-circle-btn-orange"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          ↗
        </div>
      </div>
      <div>
        <div style={{ fontSize: 'var(--font-size-kpi, 30px)', fontWeight: 600, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          {propertiesCount}
        </div>
        <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-card-desc, 11.5px)', background: 'rgba(255,255,255,0.22)', padding: '2px 8px', borderRadius: 99, color: '#FFFFFF', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
          <span>↑</span>
          <span>+ Increased from last month</span>
        </div>
      </div>
    </div>

    {/* Card 2: Active Leads (White Card) */}
    <div
      onClick={() => onNavigate('leads')}
      className="donezo-kpi-card donezo-kpi-white"
      style={{
        background: '#FFFFFF',
        color: '#252422',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: '18px',
        padding: '18px 20px',
        minHeight: '125px',
        maxHeight: '145px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        boxShadow: '0 2px 12px -2px rgba(40, 30, 20, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 'var(--font-size-card-heading, 15px)', fontWeight: 600, color: '#524E48', fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em' }}>
          Active Leads
        </span>
        <div
          className="donezo-circle-btn donezo-circle-btn-white"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#F5F3F4',
            border: '1px solid #E8E3DA',
            color: '#625E58',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          ↗
        </div>
      </div>
      <div>
        <div style={{ fontSize: 'var(--font-size-kpi, 30px)', fontWeight: 600, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, color: '#252422', letterSpacing: '-0.02em' }}>
          {leadsCount}
        </div>
        <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 'var(--font-size-card-desc, 11.5px)', background: '#EAF5E2', color: '#247044', padding: '2px 8px', borderRadius: 99, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
          <span>↑</span>
          <span>+15% increased from last month</span>
        </div>
      </div>
    </div>

    {/* Card 3: Active Deals (White Card) */}
    <div
      onClick={() => onNavigate('deals')}
      className="donezo-kpi-card donezo-kpi-white"
      style={{
        background: '#FFFFFF',
        color: '#252422',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: '18px',
        padding: '18px 20px',
        minHeight: '125px',
        maxHeight: '145px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        boxShadow: '0 2px 12px -2px rgba(40, 30, 20, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 'var(--font-size-card-heading, 15px)', fontWeight: 600, color: '#524E48', fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em' }}>
          Active Deals
        </span>
        <div
          className="donezo-circle-btn donezo-circle-btn-white"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#F5F3F4',
            border: '1px solid #E8E3DA',
            color: '#625E58',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          ↗
        </div>
      </div>
      <div>
        <div style={{ fontSize: 'var(--font-size-kpi, 30px)', fontWeight: 600, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, color: '#252422', letterSpacing: '-0.02em' }}>
          {activeDealsCount}
        </div>
        <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 'var(--font-size-card-desc, 11.5px)', background: '#F7F5F0', color: '#524E48', padding: '2px 8px', borderRadius: 99, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
          <span>In active negotiation</span>
        </div>
      </div>
    </div>

    {/* Card 4: Closed Revenue (White Card) */}
    <div
      onClick={() => onNavigate('finance')}
      className="donezo-kpi-card donezo-kpi-white"
      style={{
        background: '#FFFFFF',
        color: '#252422',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: '18px',
        padding: '18px 20px',
        minHeight: '125px',
        maxHeight: '145px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        boxShadow: '0 2px 12px -2px rgba(40, 30, 20, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 'var(--font-size-card-heading, 15px)', fontWeight: 600, color: '#524E48', fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em' }}>
          Closed Revenue
        </span>
        <div
          className="donezo-circle-btn donezo-circle-btn-white"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#F5F3F4',
            border: '1px solid #E8E3DA',
            color: '#625E58',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          ↗
        </div>
      </div>
      <div>
        <div style={{ fontSize: '26px', fontWeight: 600, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2, color: '#247044', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.02em' }} title={formatCurrency ? formatCurrency(closedRevenue) : closedRevenue}>
          {formatCurrency ? formatCurrency(closedRevenue) : `₹ ${closedRevenue}`}
        </div>
        <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 'var(--font-size-card-desc, 11.5px)', background: '#EAF5E2', color: '#247044', padding: '2px 8px', borderRadius: 99, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
          <span>Settled deed transactions</span>
        </div>
      </div>
    </div>
  </div>
);

/* ── 3. Property & Lead Analytics Component (ROW 3 - 50% Width) ── */
export const PropertyLeadAnalytics = ({ timeframe, setTimeframe }) => {
  const bars = [
    { day: 'S', height: '42%', striped: true },
    { day: 'M', height: '65%', striped: true },
    { day: 'T', height: '54%', striped: true },
    { day: 'W', height: '88%', active: true, pct: '38%' },
    { day: 'T', height: '72%', striped: false, solid: true },
    { day: 'F', height: '60%', striped: true },
    { day: 'S', height: '48%', striped: true },
  ];

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '18px', padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', boxShadow: '0 2px 12px -2px rgba(40,30,20,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-card-heading, 15px)', fontWeight: 600, color: '#252422', margin: 0, fontFamily: 'var(--font-sans)', letterSpacing: '-0.015em' }}>
            Property & Lead Analytics
          </h3>
          <p style={{ fontSize: 'var(--font-size-card-desc, 12.5px)', fontWeight: 400, color: '#89847C', margin: '2px 0 0 0', fontFamily: 'var(--font-sans)' }}>
            Weekly enquiry flow and qualified inspections
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#F7F5F0', borderRadius: 99, padding: 3, border: '1px solid rgba(0,0,0,0.04)' }}>
          <button
            onClick={() => setTimeframe('weekly')}
            style={{
              padding: '3px 10px',
              borderRadius: 99,
              fontSize: 'var(--font-size-secondary, 11.5px)',
              fontWeight: timeframe === 'weekly' ? 600 : 500,
              fontFamily: 'var(--font-sans)',
              background: timeframe === 'weekly' ? '#FFFFFF' : 'transparent',
              color: timeframe === 'weekly' ? '#252422' : '#89847C',
              border: 'none',
              cursor: 'pointer',
              boxShadow: timeframe === 'weekly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 120ms ease',
            }}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            style={{
              padding: '3px 10px',
              borderRadius: 99,
              fontSize: 'var(--font-size-secondary, 11.5px)',
              fontWeight: timeframe === 'monthly' ? 600 : 500,
              fontFamily: 'var(--font-sans)',
              background: timeframe === 'monthly' ? '#FFFFFF' : 'transparent',
              color: timeframe === 'monthly' ? '#252422' : '#89847C',
              border: 'none',
              cursor: 'pointer',
              boxShadow: timeframe === 'monthly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 120ms ease',
            }}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Pill Bars Minimalist Chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 135, padding: '12px 8px 4px' }}>
        {bars.map((bar, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            {bar.active && (
              <span style={{ fontSize: 9.5, fontWeight: 600, padding: '2px 5px', borderRadius: 4, background: '#EB5E28', color: '#FFFFFF', marginBottom: -2, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums' }}>
                {bar.pct}
              </span>
            )}
            <div
              style={{
                width: 28,
                height: bar.height,
                borderRadius: 99,
                background: bar.active ? '#EB5E28' : bar.solid ? '#252422' : '#E8E3DA',
                backgroundImage: bar.striped
                  ? 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 6px)'
                  : undefined,
                transition: 'all 200ms ease',
              }}
            />
            <span style={{ fontSize: 'var(--font-size-chart, 11.5px)', fontWeight: bar.active ? 600 : 500, color: bar.active ? '#EB5E28' : '#89847C', fontFamily: 'var(--font-sans)' }}>
              {bar.day}
            </span>
          </div>
        ))}
      </div>

      {/* Chart Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 'var(--font-size-chart, 11.5px)', color: '#89847C', fontFamily: 'var(--font-sans)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EB5E28' }} />
            <span style={{ fontWeight: 500 }}>Enquiries (Peak)</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#252422' }} />
            <span style={{ fontWeight: 500 }}>Site Visits</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8E3DA' }} />
            <span style={{ fontWeight: 500 }}>Inactive</span>
          </span>
        </div>
        <span style={{ fontWeight: 600, color: '#247044', fontVariantNumeric: 'tabular-nums' }}>+18% vs avg</span>
      </div>
    </div>
  );
};

/* ── 4. Upcoming Reminders Component (ROW 3 - 25% Width) ── */
export const UpcomingReminders = ({ appointment, onNavigate }) => {
  if (!appointment) {
    return (
      <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '18px', padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', boxShadow: '0 2px 12px -2px rgba(40,30,20,0.04)' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <h3 style={{ fontSize: 'var(--font-size-card-heading, 15px)', fontWeight: 600, color: '#252422', margin: 0, fontFamily: 'var(--font-sans)', letterSpacing: '-0.015em' }}>
              Upcoming Reminders
            </h3>
            <span style={{ fontSize: 'var(--font-size-status, 10.5px)', fontWeight: 600, color: '#89847C', background: '#F5F3F0', padding: '2px 8px', borderRadius: 99, fontFamily: 'var(--font-sans)' }}>
              SCHEDULED
            </span>
          </div>
          <p style={{ fontSize: 'var(--font-size-card-desc, 12.5px)', fontWeight: 400, color: '#89847C', margin: '0 0 10px 0', fontFamily: 'var(--font-sans)' }}>Next scheduled inspection</p>
          <div style={{ padding: '24px 14px', borderRadius: 12, background: '#FAF8F5', border: '1px dashed rgba(0,0,0,0.08)', textAlign: 'center', marginTop: 8 }}>
            <Icon name="calendar" size={24} style={{ color: '#CDC6BC', margin: '0 auto 8px', display: 'block' }} />
            <p style={{ fontSize: 13, fontWeight: 500, color: '#524E48', margin: 0 }}>No upcoming visits scheduled</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('appointments')}
          style={{
            width: '100%',
            height: 36,
            borderRadius: 99,
            background: '#252422',
            color: '#FFFFFF',
            fontSize: 'var(--font-size-button, 12.5px)',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            transition: 'background 140ms ease',
            marginTop: 12,
          }}
        >
          <Icon name="plus" size={13} />
          <span>Schedule Visit</span>
        </button>
      </div>
    );
  }

  const clientName = appointment.clientName || appointment.client_name || appointment.contactName || 'Valued Client';
  const title = appointment.title || appointment.propertyTitle || 'Property Inspection';
  const time = appointment.time || (appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '14:30');
  const status = appointment.status || 'SCHEDULED';

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '18px', padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', boxShadow: '0 2px 12px -2px rgba(40,30,20,0.04)' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <h3 style={{ fontSize: 'var(--font-size-card-heading, 15px)', fontWeight: 600, color: '#252422', margin: 0, fontFamily: 'var(--font-sans)', letterSpacing: '-0.015em' }}>
            Upcoming Reminders
          </h3>
          <span style={{ fontSize: 'var(--font-size-status, 10.5px)', fontWeight: 600, color: '#247044', background: '#EAF5E2', padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(36, 112, 68, 0.15)', fontFamily: 'var(--font-sans)' }}>
            {status}
          </span>
        </div>
        <p style={{ fontSize: 'var(--font-size-card-desc, 12.5px)', fontWeight: 400, color: '#89847C', margin: '0 0 10px 0', fontFamily: 'var(--font-sans)' }}>Next scheduled inspection</p>

        <div style={{ padding: '12px 14px', borderRadius: 12, background: '#FAF8F5', border: '1px solid rgba(0,0,0,0.05)', marginTop: 2 }}>
          <span style={{ fontSize: 'var(--font-size-meta, 10.5px)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#89847C', display: 'block', marginBottom: 2, fontFamily: 'var(--font-sans)' }}>
            Site Visit Inspection
          </span>
          <h4 style={{ fontSize: 'var(--font-size-task-title, 13px)', fontWeight: 600, color: '#252422', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-sans)' }}>
            {title}
          </h4>
          <p style={{ fontSize: 'var(--font-size-card-desc, 12px)', color: '#524E48', margin: 0, fontWeight: 400, fontFamily: 'var(--font-sans)' }}>
            Client: <strong style={{ color: '#252422', fontWeight: 600 }}>{clientName}</strong>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-meta, 11.5px)', color: '#EB5E28', fontWeight: 500, marginTop: 4, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums' }}>
            <Icon name="clock" size={12} />
            <span>Time: {time}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => onNavigate('appointments')}
          style={{
            flex: 1,
            height: 36,
            borderRadius: 99,
            background: '#252422',
            color: '#FFFFFF',
            fontSize: 'var(--font-size-button, 12.5px)',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            transition: 'background 140ms ease',
          }}
        >
          <span>Start Site Visit</span>
        </button>
        <button
          onClick={() => onNavigate('appointments')}
          style={{
            height: 36,
            padding: '0 14px',
            borderRadius: 99,
            background: '#FAF8F5',
            color: '#252422',
            fontSize: 'var(--font-size-button, 12px)',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            border: '1px solid rgba(0,0,0,0.08)',
            cursor: 'pointer',
          }}
        >
          View
        </button>
      </div>
    </div>
  );
};

/* ── 5. Priority Tasks Component (ROW 3 - 25% Width) ── */
export const PriorityTasks = ({ tasks = [], onNavigate, onOpenAddTask }) => {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '18px', padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', boxShadow: '0 2px 12px -2px rgba(40,30,20,0.04)' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <h3 style={{ fontSize: 'var(--font-size-card-heading, 15px)', fontWeight: 600, color: '#252422', margin: 0, fontFamily: 'var(--font-sans)', letterSpacing: '-0.015em' }}>
            Priority Tasks
          </h3>
          <button
            onClick={onOpenAddTask}
            style={{ fontSize: 'var(--font-size-secondary, 11.5px)', fontWeight: 600, color: '#EB5E28', background: '#FFF4ED', border: '1px solid rgba(235, 94, 40, 0.2)', borderRadius: 99, padding: '2px 8px', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 120ms ease' }}
          >
            + Add Task
          </button>
        </div>
        <p style={{ fontSize: 'var(--font-size-card-desc, 12.5px)', fontWeight: 400, color: '#89847C', margin: '0 0 10px 0', fontFamily: 'var(--font-sans)' }}>Next actionable commitments</p>

        {tasks.length === 0 ? (
          <div style={{ padding: '20px 10px', textAlign: 'center', background: '#FAF8F5', borderRadius: 10, border: '1px dashed rgba(0,0,0,0.08)', marginTop: 8 }}>
            <Icon name="checkSquare" size={20} style={{ color: '#CDC6BC', margin: '0 auto 6px', display: 'block' }} />
            <p style={{ fontSize: 12.5, fontWeight: 500, color: '#524E48', margin: 0 }}>No pending tasks.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '7px 10px',
                  borderRadius: 10,
                  background: '#FAF8F5',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: task.priority === 'URGENT' ? '#247044' : task.priority === 'HIGH' ? '#345487' : '#EB5E28',
                      color: '#FFFFFF',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={task.completed ? 'check' : 'checkSquare'} size={11} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--font-size-task-title, 12.5px)', fontWeight: 500, color: '#252422', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-sans)' }}>
                      {task.title}
                    </p>
                    <span style={{ fontSize: 'var(--font-size-meta, 10.5px)', color: '#89847C', display: 'block', fontWeight: 400, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.relatedTo || task.propertyTitle || 'Mandate Action'}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: 'var(--font-size-meta, 10.5px)', fontWeight: 500, color: '#89847C', flexShrink: 0, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums' }}>
                  {task.dueDate || task.due_date || 'Nov 8'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => onNavigate('tasks')}
        style={{ fontSize: 'var(--font-size-button, 12px)', fontWeight: 600, color: '#EB5E28', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', marginTop: 8, fontFamily: 'var(--font-sans)' }}
      >
        View All Tasks →
      </button>
    </div>
  );
};

/* ── 6. Team Collaboration Component (ROW 4 - 40% Width) ── */
export const TeamCollaboration = ({ members = [], onNavigate }) => {
  const displayMembers = members.length > 0 ? members.slice(0, 4) : [];

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '18px', padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', boxShadow: '0 2px 12px -2px rgba(40,30,20,0.04)' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <h3 style={{ fontSize: 'var(--font-size-card-heading, 15px)', fontWeight: 600, color: '#252422', margin: 0, fontFamily: 'var(--font-sans)', letterSpacing: '-0.015em' }}>
            Team Collaboration
          </h3>
          <button
            onClick={() => onNavigate('team')}
            style={{ fontSize: 'var(--font-size-secondary, 11.5px)', fontWeight: 600, color: '#524E48', background: '#F7F5F0', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 99, padding: '2px 8px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            View Team
          </button>
        </div>
        <p style={{ fontSize: 'var(--font-size-card-desc, 12.5px)', fontWeight: 400, color: '#89847C', margin: '0 0 10px 0', fontFamily: 'var(--font-sans)' }}>Agent deal execution and current assignments</p>

        {displayMembers.length === 0 ? (
          <div style={{ padding: '20px 10px', textAlign: 'center', background: '#FAF8F5', borderRadius: 10, border: '1px dashed rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: 12.5, fontWeight: 500, color: '#524E48', margin: 0 }}>No team members registered.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {displayMembers.map((m, idx) => {
              const name = m.name || m.fullName || m.full_name || 'Agent';
              const roleDisplay = m.role ? m.role.replace('_', ' ') : 'Agent';
              const colors = ['#EB5E28', '#345487', '#B69A6A', '#403D39'];
              const statusPills = [
                { status: 'Completed', bg: '#EAF5E2', color: '#247044' },
                { status: 'In Progress', bg: '#FFF4ED', color: '#EB5E28' },
                { status: 'Pending', bg: '#F5F3F0', color: '#524E48' },
                { status: 'In Progress', bg: '#FFF4ED', color: '#EB5E28' },
              ];
              const pill = statusPills[idx % statusPills.length];

              return (
                <div key={m.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '3px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: colors[idx % colors.length],
                        color: '#FFFFFF',
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {name.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: 'var(--font-size-customer-name, 13px)', fontWeight: 600, color: '#252422', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-sans)' }}>
                        {name}
                      </strong>
                      <span style={{ fontSize: 'var(--font-size-meta, 10.5px)', color: '#89847C', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 400, fontFamily: 'var(--font-sans)' }}>
                        {m.activity || roleDisplay}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-status, 10.5px)', fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: pill.bg, color: pill.color, flexShrink: 0, fontFamily: 'var(--font-sans)' }}>
                    {pill.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 'var(--font-size-meta, 11px)', color: '#89847C', marginTop: 6, fontFamily: 'var(--font-sans)' }}>
        <span>{displayMembers.length || 4} Active Brokers Online</span>
        <span style={{ fontWeight: 500, color: '#247044' }}>100% SLA Compliance</span>
      </div>
    </div>
  );
};

/* ── 7. Pipeline Progress Component (ROW 4 - 35% Width) ── */
export const PipelineProgress = ({ wonDealsCount = 0, totalDealsCount = 0, onNavigate }) => {
  const denominator = Math.max(1, totalDealsCount);
  const conversionPct = totalDealsCount === 0 ? 0 : Math.min(100, Math.round((wonDealsCount / denominator) * 100));

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '18px', padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', boxShadow: '0 2px 12px -2px rgba(40,30,20,0.04)' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <h3 style={{ fontSize: 'var(--font-size-card-heading, 15px)', fontWeight: 600, color: '#252422', margin: 0, fontFamily: 'var(--font-sans)', letterSpacing: '-0.015em' }}>
            Deal Pipeline Progress
          </h3>
          <button
            onClick={() => onNavigate('deals')}
            style={{ fontSize: 'var(--font-size-secondary, 11.5px)', fontWeight: 600, color: '#EB5E28', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            View Pipeline
          </button>
        </div>
        <p style={{ fontSize: 'var(--font-size-card-desc, 12.5px)', fontWeight: 400, color: '#89847C', margin: '0 0 6px 0', fontFamily: 'var(--font-sans)' }}>Concluded won mandates vs total opportunities</p>

        {/* Clean Semicircular SVG Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 0' }}>
          <div style={{ position: 'relative', width: 140, height: 75, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <svg width="140" height="75" viewBox="0 0 140 75" style={{ overflow: 'visible' }}>
              <path
                d="M 15 70 A 55 55 0 0 1 125 70"
                fill="none"
                stroke="#EAE6DC"
                strokeWidth="11"
                strokeLinecap="round"
              />
              <path
                d="M 15 70 A 55 55 0 0 1 125 70"
                fill="none"
                stroke="#EB5E28"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray="172.78"
                strokeDashoffset={172.78 * (1 - (conversionPct / 100))}
                style={{ transition: 'stroke-dashoffset 600ms ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', bottom: 0, textAlign: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 600, color: '#252422', display: 'block', lineHeight: 1, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                {conversionPct}%
              </span>
              <span style={{ fontSize: 'var(--font-size-meta, 10px)', color: '#89847C', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                Mandates Concluded
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--font-size-chart, 11px)', color: '#524E48', fontWeight: 500, marginTop: 12, fontFamily: 'var(--font-sans)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EB5E28' }} />
              <span>Converted ({wonDealsCount})</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#252422' }} />
              <span>In Negotiation</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EAE6DC' }} />
              <span>Remaining</span>
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 'var(--font-size-meta, 11px)', color: '#89847C', marginTop: 6, fontFamily: 'var(--font-sans)' }}>
        <span>{wonDealsCount} of {totalDealsCount} Mandates Concluded</span>
        <span style={{ fontWeight: 600, color: '#EB5E28' }}>{totalDealsCount > 0 ? 'Healthy Pipeline' : 'Awaiting Deals'}</span>
      </div>
    </div>
  );
};

/* ── 8. Today's Activity Component (ROW 4 - 25% Width) ── */
export const TodayActivity = ({ enquiriesCount = 0, visitsCount = 0, tasksCount = 0, onOpenAddLead, onNavigate }) => (
  <div style={{ background: '#1A1918', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', padding: '20px 22px', color: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <h3 style={{ fontSize: 'var(--font-size-card-heading, 15px)', fontWeight: 600, color: '#FFFFFF', margin: 0, fontFamily: 'var(--font-sans)', letterSpacing: '-0.015em' }}>
          Today's Activity
        </h3>
        <span style={{ fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: 'rgba(235, 94, 40, 0.2)', border: '1px solid rgba(235, 94, 40, 0.4)', color: '#FF7D4D', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EB5E28', display: 'inline-block' }} />
          LIVE
        </span>
      </div>
      <p style={{ fontSize: 'var(--font-size-card-desc, 12px)', fontWeight: 400, color: '#9E978D', margin: '0 0 12px 0', fontFamily: 'var(--font-sans)' }}>Operational pulses across your agency</p>

      {/* Activity Counters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-card-desc, 12px)', padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--font-sans)' }}>
          <span style={{ color: '#D3CECA', fontWeight: 400 }}>New Enquiries</span>
          <strong style={{ color: '#FFFFFF', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{enquiriesCount}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-card-desc, 12px)', padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--font-sans)' }}>
          <span style={{ color: '#D3CECA', fontWeight: 400 }}>Site Visits Scheduled</span>
          <strong style={{ color: '#FFFFFF', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{visitsCount}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-card-desc, 12px)', padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--font-sans)' }}>
          <span style={{ color: '#D3CECA', fontWeight: 400 }}>Follow-ups Due</span>
          <strong style={{ color: '#FFFFFF', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{tasksCount}</strong>
        </div>
      </div>
    </div>

    {/* Compact Quick Actions */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 12 }}>
      <button
        onClick={onOpenAddLead}
        style={{ padding: '6px 0', borderRadius: 99, background: '#EB5E28', color: '#FFFFFF', fontSize: 'var(--font-size-button, 11.5px)', fontWeight: 600, border: 'none', cursor: 'pointer', textAlign: 'center', fontFamily: 'var(--font-sans)', boxShadow: '0 2px 6px rgba(235, 94, 40, 0.3)' }}
      >
        + Lead
      </button>
      <button
        onClick={() => onNavigate('appointments')}
        style={{ padding: '6px 0', borderRadius: 99, background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: 'var(--font-size-button, 11.5px)', fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', textAlign: 'center', fontFamily: 'var(--font-sans)' }}
      >
        Visit
      </button>
      <button
        onClick={() => onNavigate('tasks')}
        style={{ padding: '6px 0', borderRadius: 99, background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: 'var(--font-size-button, 11.5px)', fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', textAlign: 'center', fontFamily: 'var(--font-sans)' }}
      >
        Task
      </button>
    </div>
  </div>
);

/* ── 9. Recent Leads Table Component (ROW 5 - Full Width) ── */
export const RecentLeads = ({ leads = [], formatCurrency, onNavigate, onOpenAddLead }) => (
  <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '18px', padding: '20px 22px', width: '100%', boxSizing: 'border-box', boxShadow: '0 2px 12px -2px rgba(40,30,20,0.04)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div>
        <h3 style={{ fontSize: 'var(--font-size-card-heading, 15px)', fontWeight: 600, color: '#252422', margin: 0, fontFamily: 'var(--font-sans)', letterSpacing: '-0.015em' }}>
          Recent Inbound Client Mandates
        </h3>
        <p style={{ fontSize: 'var(--font-size-card-desc, 12.5px)', fontWeight: 400, color: '#89847C', margin: '2px 0 0 0', fontFamily: 'var(--font-sans)' }}>
          Latest 5 client acquisitions and qualified buyer briefs
        </p>
      </div>
      <button
        onClick={() => onNavigate('leads')}
        style={{ fontSize: 'var(--font-size-secondary, 12px)', fontWeight: 600, color: '#EB5E28', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
      >
        View All Leads ({leads.length}) →
      </button>
    </div>

    {leads.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '36px 16px', background: '#FAF8F5', borderRadius: 12, border: '1px dashed rgba(0,0,0,0.08)' }}>
        <Icon name="users" size={26} style={{ color: '#CDC6BC', margin: '0 auto 8px', display: 'block' }} />
        <p style={{ fontSize: 13, fontWeight: 500, color: '#524E48', margin: '0 0 8px 0' }}>No client leads captured yet.</p>
        <button
          onClick={onOpenAddLead}
          style={{ padding: '6px 14px', borderRadius: 99, background: '#EB5E28', color: '#FFFFFF', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          + Create Lead
        </button>
      </div>
    ) : (
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 'var(--font-size-card-desc, 12.5px)', fontFamily: 'var(--font-sans)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', fontSize: 'var(--font-size-table-th, 11px)', fontWeight: 600, color: '#777168', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '10px 12px' }}>Client</th>
              <th style={{ padding: '10px 12px' }}>Status</th>
              <th style={{ padding: '10px 12px' }}>Budget Range</th>
              <th style={{ padding: '10px 12px' }}>Source</th>
              <th style={{ padding: '10px 12px' }}>Assigned Broker</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.slice(0, 5).map((lead) => {
              const clientName = `${lead.firstName || lead.first_name || ''} ${lead.lastName || lead.last_name || ''}`.trim() || lead.clientName || 'Valued Client';
              const initial = clientName.charAt(0) || 'L';
              const emailOrPhone = lead.email || lead.phoneE164 || lead.phone || '';
              const status = lead.status || 'NEW';
              const budgetDisplay = lead.budgetMin || lead.budget_min
                ? `${formatCurrency ? formatCurrency(lead.budgetMin || lead.budget_min) : lead.budgetMin} - ${formatCurrency ? formatCurrency(lead.budgetMax || lead.budget_max) : lead.budgetMax}`
                : (lead.budget ? (formatCurrency ? formatCurrency(lead.budget) : lead.budget) : 'On Request');
              const source = lead.source || 'Direct';
              const broker = lead.assignedAgent || lead.assigned_agent || 'Alexander Wright';

              return (
                <tr key={lead.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background-color 140ms ease' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#FFF0E8', color: '#EB5E28', fontSize: 10.5, fontWeight: 600, display: 'grid', placeItems: 'center', flexShrink: 0, fontFamily: 'var(--font-sans)' }}>
                        {initial}
                      </div>
                      <div>
                        <strong style={{ color: '#252422', display: 'block', fontSize: 'var(--font-size-customer-name, 13px)', fontWeight: 600 }}>
                          {clientName}
                        </strong>
                        <span style={{ fontSize: 'var(--font-size-meta, 10.5px)', color: '#89847C', fontWeight: 400 }}>{emailOrPhone}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`status-pill ${status === 'NEW' ? 'status-lost' :
                        status === 'QUALIFIED' ? 'status-qualified' : 'status-converted'
                      }`} style={{ fontSize: 'var(--font-size-status, 10px)', fontWeight: 600, borderRadius: 99 }}>
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#252422', fontVariantNumeric: 'tabular-nums' }}>
                    {budgetDisplay}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 'var(--font-size-meta, 10.5px)', padding: '2px 8px', borderRadius: 99, background: '#FAF8F5', border: '1px solid rgba(0,0,0,0.05)', color: '#524E48', fontWeight: 400 }}>
                      {source}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#524E48', fontWeight: 400, fontSize: '12px' }}>
                    {broker}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <button
                      onClick={() => onNavigate('leads')}
                      style={{ padding: '4px 10px', borderRadius: 99, background: '#FAF8F5', border: '1px solid rgba(0,0,0,0.06)', color: '#252422', fontSize: 'var(--font-size-meta, 11px)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 120ms ease' }}
                      title="Open lead dossier"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

/* ── Main DashboardPanel Component ── */
export const DashboardPanel = ({ onNavigate, onOpenAddLead, onOpenAddProperty }) => {
  const { user, formatCurrency } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('weekly');

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [overview, leads, properties, deals, appointments, tasks, members, enquiries] = await Promise.all([
        api.getDashboardOverview().catch(() => ({})),
        api.getLeads().catch(() => []),
        api.getProperties().catch(() => []),
        api.getDeals().catch(() => []),
        api.getAppointments().catch(() => []),
        api.getTasks().catch(() => []),
        api.getMembers().catch(() => []),
        api.getEnquiries().catch(() => []),
      ]);

      const asRows = value => Array.isArray(value) ? value : value?.items || [];
      setData({
        ...(overview || {}),
        allLeads: asRows(leads),
        allProperties: asRows(properties),
        allDeals: asRows(deals),
        allAppointments: asRows(appointments),
        allTasks: asRows(tasks),
        allMembers: asRows(members),
        allEnquiries: asRows(enquiries),
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics from backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ height: 36, width: 220, background: '#EAE6DC', borderRadius: 8, animation: 'pulse 1.4s infinite' }} />
        <div className="donezo-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 125, background: '#EAE6DC', borderRadius: 18, animation: 'pulse 1.4s infinite' }} />
          ))}
        </div>
        <div className="donezo-row-3" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
          <div style={{ height: 210, background: '#EAE6DC', borderRadius: 18, animation: 'pulse 1.4s infinite' }} />
          <div style={{ height: 210, background: '#EAE6DC', borderRadius: 18, animation: 'pulse 1.4s infinite' }} />
          <div style={{ height: 210, background: '#EAE6DC', borderRadius: 18, animation: 'pulse 1.4s infinite' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, borderRadius: 16, background: '#FFF0EF', border: '1px solid rgba(186, 24, 27, 0.2)', color: '#BA181B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, marginBottom: 8, fontSize: 15 }}>
          <Icon name="alertCircle" size={18} />
          <span>Error Communicating with Service Layer</span>
        </div>
        <p style={{ fontSize: 13, margin: '0 0 16px 0', color: '#524E48' }}>{error}</p>
        <button
          onClick={() => fetchDashboardData()}
          style={{ padding: '8px 16px', borderRadius: 8, background: '#BA181B', color: '#FFFFFF', fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { metrics = {} } = data || {};
  const leads = data?.allLeads || [];
  const properties = data?.allProperties || [];
  const deals = data?.allDeals || [];
  const appointments = data?.allAppointments || [];
  const tasks = data?.allTasks || [];
  const members = data?.allMembers || [];
  const enquiries = data?.allEnquiries || [];

  const activeDeals = deals.filter(d => d.stage !== 'CLOSED_LOST' && d.stage !== 'CLOSED_WON');
  const wonDeals = deals.filter(d => d.stage === 'CLOSED_WON');
  const closedRevenue = wonDeals.reduce((sum, d) => sum + (Number(d.dealValue || d.deal_value) || 0), 0) || (metrics.totalRevenue ? Number(metrics.totalRevenue) : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', boxSizing: 'border-box' }}>
      {/* ── ROW 1: Dashboard Header ── */}
      <DashboardHeader
        onOpenAddProperty={onOpenAddProperty}
        onOpenAddLead={onOpenAddLead}
        onRefresh={() => fetchDashboardData(true)}
        refreshing={refreshing}
      />

      {/* ── ROW 2: Four Compact Equal KPI Cards in ONE Horizontal Row ── */}
      <DashboardStats
        propertiesCount={properties.length}
        leadsCount={leads.length}
        activeDealsCount={activeDeals.length}
        closedRevenue={closedRevenue}
        formatCurrency={formatCurrency}
        onNavigate={onNavigate}
      />

      {/* ── ROW 3: Analytics (50%), Reminders (25%), Priority Tasks (25%) ── */}
      <div className="donezo-row-3" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', width: '100%', alignItems: 'stretch' }}>
        <PropertyLeadAnalytics timeframe={timeframe} setTimeframe={setTimeframe} />
        <UpcomingReminders appointment={appointments[0]} onNavigate={onNavigate} />
        <PriorityTasks tasks={tasks} onNavigate={onNavigate} onOpenAddTask={onOpenAddLead} />
      </div>

      {/* ── ROW 4: Team Collaboration (40%), Pipeline Progress (35%), Today's Activity (25%) ── */}
      <div className="donezo-row-4" style={{ display: 'grid', gridTemplateColumns: '8fr 7fr 5fr', gap: '16px', width: '100%', alignItems: 'stretch' }}>
        <TeamCollaboration members={members} onNavigate={onNavigate} />
        <PipelineProgress
          wonDealsCount={wonDeals.length}
          totalDealsCount={deals.length}
          onNavigate={onNavigate}
        />
        <TodayActivity
          enquiriesCount={enquiries.length}
          visitsCount={appointments.length}
          tasksCount={tasks.filter(t => !t.completed).length}
          onOpenAddLead={onOpenAddLead}
          onNavigate={onNavigate}
        />
      </div>

      {/* ── ROW 5: Recent Leads Table (Full Available Width) ── */}
      <RecentLeads leads={leads} formatCurrency={formatCurrency} onNavigate={onNavigate} onOpenAddLead={onOpenAddLead} />
    </div>
  );
};
