// src/screens/admin/AdminDashboard.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../services/AuthContext';
import {
  getAllTeachers,
  getAllStudents,
  getAllClasses,
  getAllNotices,
  getAttendance,
  createTeacher,
  createClass,
  assignClassToTeacher,
} from '../../services/api';

import {
  DashboardHeader,
  StatCard,
  SectionHeader,
  NoticeCard,
  Card,
  RiskBadge,
  EmptyState,
  LoadingScreen,
  ErrorBox,
  SuccessBox,
  Badge,
  ModalForm,
  TextInputField,
  PrimaryButton,
} from '../../components';

import { COLORS, SIZES, FONTS } from '../../constants/theme';

const toArray = (obj) =>
  obj ? Object.entries(obj).map(([id, val]) => ({ id, ...val })) : [];

export default function AdminDashboard() {
  const { token, logout } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Modal states
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showAssignClassModal, setShowAssignClassModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Teacher form state
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
  });

  // Class form state
  const [classForm, setClassForm] = useState({
    className: '',
    section: '',
    teacherId: '',
    teacherEmail: '',
  });

  // Assign class form state
  const [assignForm, setAssignForm] = useState({
    classId: '',
    teacherId: '',
  });

  const fetchAll = useCallback(async () => {
    try {
      setError('');
      const [td, sd, cd, nd, ad] = await Promise.all([
        getAllTeachers(token),
        getAllStudents(token),
        getAllClasses(token),
        getAllNotices(token),
        getAttendance(token),
      ]);
      setTeachers(toArray(td));
      setStudents(toArray(sd));
      setClasses(toArray(cd));
      setNotices(toArray(nd).reverse());
      setAttendance(ad ?? {});
    } catch {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // ─────────────── HANDLERS ───────────────────────────────────────────────
  const handleAddTeacher = async () => {
    // Validation
    if (!teacherForm.name.trim()) {
      setError('❌ Teacher name is required.');
      return;
    }
    
    if (!teacherForm.email.trim()) {
      setError('❌ Teacher email is required.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacherForm.email)) {
      setError('❌ Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await createTeacher(teacherForm, token);
      
      // Show success and reset form
      const teacherName = teacherForm.name;
      setTeacherForm({ name: '', email: '', phone: '', subject: '' });
      setShowAddTeacherModal(false);
      setError('');
      setSuccess(`✅ Teacher "${teacherName}" added successfully!`);
      
      // Refresh data
      await fetchAll();
    } catch (err) {
      const errorMsg = err.message || 'Unknown error';
      if (errorMsg.includes('Firebase')) {
        setError('❌ Failed to connect. Please check your internet and try again.');
      } else {
        setError(`❌ Error: ${errorMsg}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateClass = async () => {
    // Validation
    if (!classForm.className.trim()) {
      setError('❌ Class name is required.');
      return;
    }

    if (!classForm.section.trim()) {
      setError('❌ Section is required.');
      return;
    }

    if (!classForm.teacherId) {
      setError('❌ Please select a teacher.');
      return;
    }

    setSubmitting(true);
    try {
      const teacher = teachers.find((t) => t.id === classForm.teacherId);
      const classNameDisplay = `${classForm.className}-${classForm.section}`;
      
      await createClass(classForm, token);
      
      // Show success and reset form
      setClassForm({ className: '', section: '', teacherId: '', teacherEmail: '' });
      setShowCreateClassModal(false);
      setError('');
      setSuccess(`✅ Class "${classNameDisplay}" created and assigned to ${teacher?.name}!`);
      
      // Refresh data
      await fetchAll();
    } catch (err) {
      const errorMsg = err.message || 'Unknown error';
      if (errorMsg.includes('Firebase')) {
        setError('❌ Failed to connect. Please check your internet and try again.');
      } else {
        setError(`❌ Error: ${errorMsg}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignClass = async () => {
    // Validation
    if (!assignForm.classId) {
      setError('❌ Please select a class.');
      return;
    }

    if (!assignForm.teacherId) {
      setError('❌ Please select a teacher.');
      return;
    }

    setSubmitting(true);
    try {
      const cls = classes.find((c) => c.id === assignForm.classId);
      const teacher = teachers.find((t) => t.id === assignForm.teacherId);
      
      await assignClassToTeacher(assignForm.classId, assignForm.teacherId, token);
      
      // Show success and reset form
      setAssignForm({ classId: '', teacherId: '' });
      setShowAssignClassModal(false);
      setError('');
      setSuccess(`✅ Class "${cls.className}-${cls.section}" assigned to ${teacher?.name}!`);
      
      // Refresh data
      await fetchAll();
    } catch (err) {
      const errorMsg = err.message || 'Unknown error';
      if (errorMsg.includes('Firebase')) {
        setError('❌ Failed to connect. Please check your internet and try again.');
      } else {
        setError(`❌ Error: ${errorMsg}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading Admin data…" />;

  const highRiskCount = students.filter(
    (s) => s.riskLevel === 'HIGH'
  ).length;

  // ───────────────── OVERVIEW TAB ─────────────────
  const OverviewTab = () => (
    <>
      <SectionHeader title="Quick Stats" />

      <View style={styles.statsGrid}>
        <StatCard
          label="Teachers"
          value={teachers.length}
          icon={<FontAwesome5 name="chalkboard-teacher" size={18} color="#fff" />}
          color={COLORS.success}
        />
        <StatCard
          label="Students"
          value={students.length}
          icon={<Ionicons name="school" size={18} color="#fff" />}
          color={COLORS.info}
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label="Classes"
          value={classes.length}
          icon={<MaterialIcons name="class" size={18} color="#fff" />}
          color={COLORS.primary}
        />
        <StatCard
          label="High Risk"
          value={highRiskCount}
          icon={<MaterialIcons name="warning" size={18} color="#fff" />}
          color={COLORS.danger}
        />
      </View>

      <SectionHeader title="Actions" />
      <View style={styles.actionButtons}>
        <PrimaryButton
          title="+ Add Teacher"
          onPress={() => setShowAddTeacherModal(true)}
          color={COLORS.success}
          style={{ flex: 1 }}
        />
        <PrimaryButton
          title="+ Create Class"
          onPress={() => setShowCreateClassModal(true)}
          color={COLORS.primary}
          style={{ flex: 1 }}
        />
      </View>

      <PrimaryButton
        title="🔗 Assign Class to Teacher"
        onPress={() => setShowAssignClassModal(true)}
        color={COLORS.info}
        style={{ marginTop: 8 }}
      />

      <SectionHeader title="Attendance Summary" subtitle="Last sessions" />

      {Object.entries(attendance).map(([classId, dates]) => {
        const cls = classes.find((c) => c.id === classId);
        const dateKeys = Object.keys(dates).sort().reverse();

        return (
          <Card key={classId}>
            <Text style={styles.nameText}>
              {cls
                ? `${cls.className} - ${cls.section}`
                : classId}
            </Text>

            {dateKeys.map((date) => {
              const present = Object.values(dates[date]).filter(Boolean).length;
              const total = Object.values(dates[date]).length;
              const pct = total
                ? Math.round((present / total) * 100)
                : 0;

              const color =
                pct >= 75
                  ? COLORS.success
                  : pct >= 50
                  ? COLORS.warning
                  : COLORS.danger;

              return (
                <View key={date} style={styles.attRow}>
                  <Text style={styles.metaText}>{date}</Text>
                  <View style={styles.attBarBg}>
                    <View
                      style={[
                        styles.attBar,
                        { width: `${pct}%`, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.pctText, { color }]}>
                    {pct}%
                  </Text>
                </View>
              );
            })}
          </Card>
        );
      })}
    </>
  );

  // ───────────────── CLASSES TAB ─────────────────
  const ClassesTab = () => (
    <>
      <SectionHeader
        title="All Classes"
        subtitle={`${classes.length} classes`}
      />

      {classes.length === 0 ? (
        <EmptyState
          icon={<MaterialIcons name="class" size={40} color={COLORS.medium} />}
          message="No classes found."
        />
      ) : (
        classes.map((c) => {
          const teacher = teachers.find((t) => t.id === c.teacherId);
          const classStudents = students.filter(
            (s) => s.classId === c.id
          );

          return (
            <Card key={c.id}>
              <View style={styles.rowBetween}>
                <Text style={styles.nameText}>
                  {c.className} - Section {c.section}
                </Text>
                <Badge
                  label={`${classStudents.length} students`}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.iconRow}>
                <FontAwesome5 name="chalkboard-teacher" size={14} color={COLORS.medium} />
                <Text style={styles.metaText}>
                  {teacher?.name ?? c.teacherEmail}
                </Text>
              </View>

              <View style={styles.iconRow}>
                <MaterialIcons name="email" size={14} color={COLORS.medium} />
                <Text style={styles.metaText}>
                  {c.teacherEmail}
                </Text>
              </View>
            </Card>
          );
        })
      )}
    </>
  );

  // ───────────────── STUDENTS TAB ─────────────────
  const StudentsTab = () => (
    <>
      <SectionHeader
        title="All Students"
        subtitle={`${students.length} enrolled`}
      />

      {students.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="school" size={40} color={COLORS.medium} />}
          message="No students found."
        />
      ) : (
        students.map((s) => (
          <Card key={s.id}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nameText}>{s.name}</Text>

                <View style={styles.iconRow}>
                  <MaterialIcons name="class" size={14} color={COLORS.medium} />
                  <Text style={styles.metaText}>
                    {s.className}
                  </Text>
                </View>

                <View style={styles.iconRow}>
                  <MaterialIcons name="family-restroom" size={14} color={COLORS.medium} />
                  <Text style={styles.metaText}>
                    {s.parentEmail}
                  </Text>
                </View>
              </View>

              <RiskBadge level={s.riskLevel} />
            </View>
          </Card>
        ))
      )}
    </>
  );

  // ───────────────── NOTICES TAB ─────────────────
  const NoticesTab = () => (
    <>
      <SectionHeader
        title="Notices"
        subtitle={`${notices.length} total`}
      />

      {notices.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="notifications" size={40} color={COLORS.medium} />}
          message="No notices posted."
        />
      ) : (
        notices.map((n) => (
          <NoticeCard
            key={n.id}
            title={n.title}
            message={n.message}
            createdBy={n.createdBy}
            createdAt={n.createdAt}
          />
        ))
      )}
    </>
  );

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'dashboard' },
    { key: 'classes', label: 'Classes', icon: 'class' },
    { key: 'students', label: 'Students', icon: 'school' },
    { key: 'notices', label: 'Notices', icon: 'notifications' },
  ];

  return (
    <View style={styles.root}>
      <DashboardHeader
        name="Admin"
        role="Administrator"
        onLogout={logout}
        color={COLORS.primary}
      />

      <View style={styles.tabBar}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.tab,
              activeTab === t.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(t.key)}
          >
            <MaterialIcons
              name={t.icon}
              size={18}
              color={
                activeTab === t.key
                  ? COLORS.primary
                  : COLORS.medium
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === t.key && styles.tabTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAll();
            }}
          />
        }
      >
        {error ? <ErrorBox message={error} /> : null}
        {success ? <SuccessBox message={success} /> : null}

        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'classes' && <ClassesTab />}
        {activeTab === 'students' && <StudentsTab />}
        {activeTab === 'notices' && <NoticesTab />}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Teacher Modal */}
      <ModalForm
        visible={showAddTeacherModal}
        title="Add Teacher"
        onClose={() => setShowAddTeacherModal(false)}
        onSubmit={handleAddTeacher}
        loading={submitting}
      >
        <TextInputField
          label="Name"
          placeholder="Teacher name"
          value={teacherForm.name}
          onChangeText={(name) => setTeacherForm({ ...teacherForm, name })}
        />
        <TextInputField
          label="Email"
          placeholder="teacher@example.com"
          value={teacherForm.email}
          onChangeText={(email) => setTeacherForm({ ...teacherForm, email })}
        />
        <TextInputField
          label="Phone (optional)"
          placeholder="Phone number"
          value={teacherForm.phone}
          onChangeText={(phone) => setTeacherForm({ ...teacherForm, phone })}
        />
        <TextInputField
          label="Subject (optional)"
          placeholder="Mathematics, Science, etc."
          value={teacherForm.subject}
          onChangeText={(subject) => setTeacherForm({ ...teacherForm, subject })}
        />
      </ModalForm>

      {/* Create Class Modal */}
      <ModalForm
        visible={showCreateClassModal}
        title="Create Class"
        onClose={() => setShowCreateClassModal(false)}
        onSubmit={handleCreateClass}
        loading={submitting}
      >
        <TextInputField
          label="Class Name"
          placeholder="e.g., 10-A"
          value={classForm.className}
          onChangeText={(className) => setClassForm({ ...classForm, className })}
        />
        <TextInputField
          label="Section"
          placeholder="e.g., A, B, C"
          value={classForm.section}
          onChangeText={(section) => setClassForm({ ...classForm, section })}
        />
        <View style={styles.pickerContainer}>
          <Text style={styles.inputLabel}>Select Teacher</Text>
          <ScrollView style={styles.teacherList}>
            {teachers.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.teacherOption,
                  classForm.teacherId === t.id && styles.teacherOptionActive,
                ]}
                onPress={() =>
                  setClassForm({
                    ...classForm,
                    teacherId: t.id,
                    teacherEmail: t.email,
                  })
                }
              >
                <Text
                  style={[
                    styles.teacherOptionText,
                    classForm.teacherId === t.id &&
                      styles.teacherOptionTextActive,
                  ]}
                >
                  {t.name} ({t.email})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ModalForm>

      {/* Assign Class Modal */}
      <ModalForm
        visible={showAssignClassModal}
        title="Assign Class to Teacher"
        onClose={() => setShowAssignClassModal(false)}
        onSubmit={handleAssignClass}
        loading={submitting}
      >
        <View style={styles.pickerContainer}>
          <Text style={styles.inputLabel}>Select Class</Text>
          <ScrollView style={styles.teacherList}>
            {classes.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.teacherOption,
                  assignForm.classId === c.id && styles.teacherOptionActive,
                ]}
                onPress={() => setAssignForm({ ...assignForm, classId: c.id })}
              >
                <Text
                  style={[
                    styles.teacherOptionText,
                    assignForm.classId === c.id &&
                      styles.teacherOptionTextActive,
                  ]}
                >
                  {c.className} - Section {c.section}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.inputLabel}>Select Teacher</Text>
          <ScrollView style={styles.teacherList}>
            {teachers.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.teacherOption,
                  assignForm.teacherId === t.id && styles.teacherOptionActive,
                ]}
                onPress={() =>
                  setAssignForm({ ...assignForm, teacherId: t.id })
                }
              >
                <Text
                  style={[
                    styles.teacherOptionText,
                    assignForm.teacherId === t.id &&
                      styles.teacherOptionTextActive,
                  ]}
                >
                  {t.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ModalForm>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SIZES.padding, paddingTop: 12 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.xs,
    color: COLORS.medium,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
  },

  statsGrid: { flexDirection: 'row', marginHorizontal: -6 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },

  pickerContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: SIZES.sm,
    fontWeight: FONTS.semiBold,
    color: COLORS.dark,
    marginBottom: 6,
  },
  teacherList: {
    maxHeight: 200,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  teacherOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  teacherOptionActive: {
    backgroundColor: COLORS.primary + '20',
  },
  teacherOptionText: {
    fontSize: SIZES.sm,
    color: COLORS.dark,
  },
  teacherOptionTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
  },

  nameText: {
    fontSize: SIZES.md,
    fontWeight: FONTS.bold,
    color: COLORS.dark,
  },
  metaText: {
    fontSize: SIZES.sm,
    color: COLORS.medium,
  },

  attRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  attBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  attBar: { height: 8, borderRadius: 4 },
  pctText: {
    width: 36,
    fontSize: SIZES.xs,
    fontWeight: FONTS.bold,
    textAlign: 'right',
  },
});