import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Cloud Firestore Security Rules Validation for Simin High School', () => {
  const rulesPath = path.resolve(__dirname, '../firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

  it('rules file exists and is non-empty', () => {
    expect(fs.existsSync(rulesPath)).toBe(true);
    expect(rulesContent.length).toBeGreaterThan(500);
  });

  it('enforces rules_version = 2 and cloud.firestore service declaration', () => {
    expect(rulesContent).toMatch(/rules_version\s*=\s*'2';/);
    expect(rulesContent).toMatch(/service\s+cloud\.firestore/);
    expect(rulesContent).toMatch(/match\s+\/databases\/\{database\}\/documents/);
  });

  it('contains root-level default deny rule', () => {
    expect(rulesContent).toMatch(/match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
  });

  it('enforces simin.hs.kr school domain restriction in isSiminMember', () => {
    expect(rulesContent).toContain('isSiminMember()');
    expect(rulesContent).toContain('@simin[.]hs[.]kr$');
  });

  it('defines teacher and admin role checks based on trusted sources', () => {
    expect(rulesContent).toContain('isTeacher()');
    expect(rulesContent).toContain('exists(/databases/$(database)/documents/teachers/$(request.auth.uid))');
    expect(rulesContent).toContain('isAdmin()');
  });

  it('defines all required domain validator functions', () => {
    expect(rulesContent).toContain('isValidTeacher(');
    expect(rulesContent).toContain('isValidClass(');
    expect(rulesContent).toContain('isValidStudent(');
    expect(rulesContent).toContain('isValidProgress(');
    expect(rulesContent).toContain('isValidObservation(');
  });

  it('calls domain validators in both create and update operations to prevent update bypass', () => {
    // Teachers
    expect(rulesContent).toMatch(/match\s+\/teachers\/\{teacherId\}[\s\S]*?allow\s+create:[\s\S]*?isValidTeacher/);
    expect(rulesContent).toMatch(/match\s+\/teachers\/\{teacherId\}[\s\S]*?allow\s+update:[\s\S]*?isValidTeacher/);

    // Classes
    expect(rulesContent).toMatch(/match\s+\/classes\/\{classId\}[\s\S]*?allow\s+create:[\s\S]*?isValidClass/);
    expect(rulesContent).toMatch(/match\s+\/classes\/\{classId\}[\s\S]*?allow\s+update:[\s\S]*?isValidClass/);

    // Students
    expect(rulesContent).toMatch(/match\s+\/students\/\{studentId\}[\s\S]*?allow\s+create:[\s\S]*?isValidStudent/);
    expect(rulesContent).toMatch(/match\s+\/students\/\{studentId\}[\s\S]*?allow\s+update:[\s\S]*?isValidStudent/);

    // Progress
    expect(rulesContent).toMatch(/match\s+\/progress\/\{lessonId\}[\s\S]*?allow\s+create:[\s\S]*?isValidProgress/);
    expect(rulesContent).toMatch(/match\s+\/progress\/\{lessonId\}[\s\S]*?allow\s+update:[\s\S]*?isValidProgress/);

    // Observations
    expect(rulesContent).toMatch(/match\s+\/observations\/\{obsId\}[\s\S]*?allow\s+create:[\s\S]*?isValidObservation/);
    expect(rulesContent).toMatch(/match\s+\/observations\/\{obsId\}[\s\S]*?allow\s+update:[\s\S]*?isValidObservation/);
  });

  it('enforces immutable fields protection and anti-tampering guards on updates', () => {
    expect(rulesContent).toContain('areImmutableFieldsUnchanged(');
    expect(rulesContent).toContain('isStudentNotTamperingTeacherFeedback()');
  });

  it('enforces DoS limits on all collection string fields and array sizes', () => {
    expect(rulesContent).toContain('isValidBoundedString(');
    expect(rulesContent).toContain('data.completedCorners.size() <= 20');
    expect(rulesContent).toContain('data.quizScores.size() <= 50');
    expect(rulesContent).toContain('data.observedLogs.size() <= 100');
    expect(rulesContent).toContain('isValidBoundedString(data.detail, 1, 2000)');
  });
});
