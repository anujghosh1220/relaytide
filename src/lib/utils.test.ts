import { describe, it, expect } from 'vitest';
import { formatRelativeTime, calculateResponseTime, isOverdue, formatDuration } from './utils';

describe('formatRelativeTime', () => {
  it('formats minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60000).toISOString();
    expect(formatRelativeTime(date)).toBe('5m ago');
  });

  it('formats hours ago', () => {
    const date = new Date(Date.now() - 2 * 3600000).toISOString();
    expect(formatRelativeTime(date)).toBe('2h ago');
  });

  it('formats days ago', () => {
    const date = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(formatRelativeTime(date)).toBe('3d ago');
  });

  it('returns just now for very recent times', () => {
    const date = new Date(Date.now() - 10000).toISOString();
    expect(formatRelativeTime(date)).toBe('just now');
  });
});

describe('calculateResponseTime', () => {
  it('calculates response time in minutes', () => {
    const createdAt = '2024-01-01T10:00:00Z';
    const responseAt = '2024-01-01T10:18:00Z';
    expect(calculateResponseTime(createdAt, responseAt)).toBe(18);
  });

  it('handles hour differences', () => {
    const createdAt = '2024-01-01T10:00:00Z';
    const responseAt = '2024-01-01T11:30:00Z';
    expect(calculateResponseTime(createdAt, responseAt)).toBe(90);
  });
});

describe('isOverdue', () => {
  it('returns true when past due date and no response', () => {
    const ticket = {
      response_due_at: new Date(Date.now() - 3600000).toISOString(),
      first_response_at: null,
      status: 'open',
    };
    expect(isOverdue(ticket)).toBe(true);
  });

  it('returns false when already responded', () => {
    const ticket = {
      response_due_at: new Date(Date.now() - 3600000).toISOString(),
      first_response_at: new Date(Date.now() - 7200000).toISOString(),
      status: 'open',
    };
    expect(isOverdue(ticket)).toBe(false);
  });

  it('returns false when ticket is resolved', () => {
    const ticket = {
      response_due_at: new Date(Date.now() - 3600000).toISOString(),
      first_response_at: null,
      status: 'resolved',
    };
    expect(isOverdue(ticket)).toBe(false);
  });

  it('returns false when no due date', () => {
    const ticket = {
      response_due_at: null,
      first_response_at: null,
      status: 'open',
    };
    expect(isOverdue(ticket)).toBe(false);
  });

  it('returns false when due date is in future', () => {
    const ticket = {
      response_due_at: new Date(Date.now() + 3600000).toISOString(),
      first_response_at: null,
      status: 'open',
    };
    expect(isOverdue(ticket)).toBe(false);
  });
});

describe('formatDuration', () => {
  it('formats minutes', () => {
    expect(formatDuration(18)).toBe('18m');
  });

  it('formats hours', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
  });
});
