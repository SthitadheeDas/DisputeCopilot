import fs from 'fs';
import { ACTIVITY_LOG_FILE } from '../config.js';
import { ActivityLogEntry } from '../types/dispute.js';

export function getActivityLog(): ActivityLogEntry[] {
  try {
    if (!fs.existsSync(ACTIVITY_LOG_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(ACTIVITY_LOG_FILE, 'utf-8');
    return JSON.parse(raw) as ActivityLogEntry[];
  } catch (err) {
    console.error(`[Activity] Error reading activity-log.json:`, err);
    return [];
  }
}

export function logActivity(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>): ActivityLogEntry {
  const currentLogs = getActivityLog();
  const newEntry: ActivityLogEntry = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  try {
    const updated = [newEntry, ...currentLogs];
    fs.writeFileSync(ACTIVITY_LOG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[Activity] Error saving activity log entry:`, err);
  }

  return newEntry;
}
