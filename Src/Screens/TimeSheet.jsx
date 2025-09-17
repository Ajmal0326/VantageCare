import React, { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { AuthContext } from '../Contexts/AuthContext';
import { UserContext } from '../Contexts/UserContext';

const primarycolor = '#1479FF';

/* ----------------------------------------------------------------
   Helpers (robust normalizers + local date handling to avoid UTC)
----------------------------------------------------------------- */
const ROLE_DURATION_MIN = { morning: 360, evening: 360, night: 600 };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const safeStr = (v) => (typeof v === 'string' ? v.trim() : v ?? '');
const isPending = (s) => safeStr(s?.status || '').toLowerCase() === 'pending';

function normalizeYMD(input) {
  const s = safeStr(input);
  if (!s) return '';
  const m = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (!m) return s;
  const [, y, mo, d] = m;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function normalizeHM(input) {
  const s = safeStr(input).toLowerCase().replace(/\s+/g, '');
  if (!s) return '';
  // 6pm / 6:30pm / 12am
  let m = s.match(/^(\d{1,2})(?::?(\d{2}))?(am|pm)$/);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2] || '0', 10);
    if (m[3] === 'pm' && h !== 12) h += 12;
    if (m[3] === 'am' && h === 12) h = 0;
    return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
  }
  // 18:00 / 18.00 / 18h00 / 18 / 8:5
  m = s.match(/^(\d{1,2})(?::|\.|h)?(\d{1,2})?$/);
  if (m) {
    const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
    const min = Math.min(59, Math.max(0, parseInt(m[2] || '0', 10)));
    return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
  }
  return s;
}

// step HH:mm by "delta" minutes, clamped 00:00..23:59
function stepHM(hm, delta = 15) {
  const [H, M] = normalizeHM(hm || '00:00').split(':').map((n) => parseInt(n || '0', 10));
  let total = H * 60 + M + delta;
  total = Math.max(0, Math.min(1439, total));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function localDateFrom(ymdStr, hmStr = '00:00') {
  const [y, mo, d] = normalizeYMD(ymdStr).split('-').map((n) => parseInt(n, 10));
  const [H, M] = normalizeHM(hmStr).split(':').map((n) => parseInt(n || '0', 10));
  return new Date(y, (mo || 1) - 1, d || 1, H || 0, M || 0, 0, 0);
}

function startOfIsoWeek(d = new Date()) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Mon=0
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function ymd(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function fmtDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mon = MONTHS[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd} ${mon} ${yyyy}`;
}
function fmtRange(a, b) { return `${fmtDate(a)} - ${fmtDate(b)}`; }
function fmtHours(n) { return n.toFixed(2); }
function weekdayLabel(d) {
  const wd = WEEKDAYS[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const mon = MONTHS[d.getMonth()];
  return `${wd} ${dd} ${mon}`;
}
function time12h(hm) {
  const [H, m] = normalizeHM(hm || '').split(':');
  const HH = parseInt(H || '0', 10);
  const ampm = HH >= 12 ? 'PM' : 'AM';
  const h = HH % 12 || 12;
  return `${h}:${String(m || '00').padStart(2,'0')} ${ampm}`;
}

function parseShiftToRange(shift) {
  const dateStr = normalizeYMD(shift?.shiftDate);
  const start = dateStr && shift?.shiftStartTime ? localDateFrom(dateStr, shift.shiftStartTime) : null;
  if (!start) return { start: null, end: null };

  let end = null;
  if (shift?.shiftEndTime) {
    const candidate = localDateFrom(dateStr, shift.shiftEndTime);
    end = candidate < start ? new Date(candidate.getTime() + 24 * 60 * 60000) : candidate; // strict overnight
  } else if (typeof shift?.durationMinutes === 'number') {
    end = new Date(start.getTime() + shift.durationMinutes * 60000);
  } else if (shift?.shiftRole) {
    const mins = ROLE_DURATION_MIN[(shift.shiftRole || '').toLowerCase()] || 0;
    if (mins > 0) end = new Date(start.getTime() + mins * 60000);
  }
  return { start, end };
}

function shiftHours(shift) {
  const { start, end } = parseShiftToRange(shift);
  if (!start || !end) return 0;
  const hrs = (end.getTime() - start.getTime()) / 3600000;
  const clamped = Math.max(0, Math.min(24, hrs));
  return Math.round(clamped * 100) / 100;
}

function daysCoveredByShift(s) {
  const { start, end } = parseShiftToRange(s);
  if (!start || !end) return [];
  const out = [];
  const d = new Date(start); d.setHours(0,0,0,0);
  while (d <= end) { out.push(ymd(d)); d.setDate(d.getDate() + 1); }
  return out;
}

/* --------------------------------------------------------------
   Component
-------------------------------------------------------------- */
const TimeSheet = () => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const { userID } = useContext(UserContext);

  const [weekStart, setWeekStart] = useState(startOfIsoWeek(new Date()));
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const [userDocId, setUserDocId] = useState(null);
  const [allShiftsRaw, setAllShiftsRaw] = useState([]); // full raw array from Firestore

  const [myWeekShifts, setMyWeekShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // inline editor state
  const [editing, setEditing] = useState(null); // { idx, start, end, key:{date,start,end,role} }

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      return { key: ymd(d), date: d };
    }),
    [weekStart]
  );

  const computeWeek = useCallback((rawShifts) => {
    const list = (rawShifts || []);
    const startStr = ymd(weekStart);
    const endStrExclusive = ymd(addDays(weekEnd, 1));

    return list
      .map((s) => ({
        ...s,
        shiftDate: normalizeYMD(s?.shiftDate),
        shiftStartTime: normalizeHM(s?.shiftStartTime),
        ...(s?.shiftEndTime ? { shiftEndTime: normalizeHM(s.shiftEndTime) } : {}),
        status: safeStr(s?.status) || 'assigned',
        shiftRole: safeStr(s?.shiftRole).toLowerCase(),
      }))
      .filter((s) => s.status.toLowerCase() !== 'cancelled')
      .filter((s) => s.shiftDate && s.shiftDate >= startStr && s.shiftDate < endStrExclusive)
      .sort((a, b) => {
        const sa = parseShiftToRange(a).start?.getTime() ?? 0;
        const sb = parseShiftToRange(b).start?.getTime() ?? 0;
        return sa - sb;
      });
  }, [weekStart, weekEnd]);

  const fetchMyWeek = useCallback(async () => {
    const current = auth().currentUser;
    const email = current?.email || null;
    const uid = current?.uid || userID || null;
    if (!email && !uid) return;

    setLoading(true);
    setError(null);
    try {
      const col = firestore().collection('UsersDetail');

      let snap = email ? await col.where('email', '==', email).limit(1).get() : null;
      if ((!snap || snap.empty) && uid) {
        snap = await col.where('uid', '==', uid).limit(1).get();
      }

      if (!snap || snap.empty) {
        setUserDocId(null);
        setAllShiftsRaw([]);
        setMyWeekShifts([]);
        setLoading(false);
        return;
      }

      const docId = snap.docs[0].id;
      const docData = snap.docs[0].data();
      const rawShifts = Array.isArray(docData?.shifts) ? docData.shifts : [];

      setUserDocId(docId);
      setAllShiftsRaw(rawShifts);
      setMyWeekShifts(computeWeek(rawShifts));
    } catch (e) {
      console.error('Timesheet fetch error:', e);
      setError('Failed to load timesheet.');
    } finally {
      setLoading(false);
    }
  }, [weekStart, weekEnd, userID, computeWeek]);

  useEffect(() => { fetchMyWeek(); }, [fetchMyWeek]);

  // recompute when window changes but raw stays
  useEffect(() => {
    setMyWeekShifts(computeWeek(allShiftsRaw));
  }, [weekStart, weekEnd, allShiftsRaw, computeWeek]);

  const assignedKeys = useMemo(() => {
    const set = new Set();
    myWeekShifts.forEach(s => daysCoveredByShift(s).forEach(k => set.add(k)));
    return set;
  }, [myWeekShifts]);

  const unassignedDays = useMemo(
    () => weekDays.filter(d => !assignedKeys.has(d.key)),
    [weekDays, assignedKeys]
  );

  const totalHours = useMemo(() => {
    const sum = myWeekShifts.reduce((acc, s) => acc + shiftHours(s), 0);
    return fmtHours(sum);
  }, [myWeekShifts]);

  const handlePrevWeek = () => setWeekStart(addDays(weekStart, -7));
  const handleNextWeek = () => setWeekStart(addDays(weekStart, +7));

  async function logoutUser() {
    try {
      await auth().signOut();
      setIsLoggedIn(false);
      Alert.alert('Logout Successful', 'You have been signed out.');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'An error occurred during logout.');
    }
  }

  const onSubmitTimesheet = () => {
    if (myWeekShifts.length === 0) {
      Alert.alert('Nothing to submit', 'You have no assigned shifts this week.');
      return;
    }
    Alert.alert('Submitted', 'Your timesheet has been submitted for this week.');
  };

  /* ---------------- Edit flow (same as web semantics) ---------------- */
  function beginEdit(idx) {
    const s = myWeekShifts[idx];
    if (isPending(s)) {
      Alert.alert('Awaiting approval', 'This shift already has a time-change request. You can edit again after HR responds.');
      return;
    }
    setEditing({
      idx,
      start: normalizeHM(s.shiftStartTime || '08:00'),
      end: normalizeHM(s.shiftEndTime || '17:00'),
      key: {
        date: s.shiftDate,
        start: normalizeHM(s.shiftStartTime || ''),
        end: normalizeHM(s.shiftEndTime || ''),
        role: safeStr(s.shiftRole || ''),
      },
    });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function saveEdit() {
    if (!editing || !userDocId) return;

    const newStart = normalizeHM(editing.start);
    const newEnd = normalizeHM(editing.end);
    if (!newStart || !newEnd) {
      Alert.alert('Invalid time', 'Please enter both start and end times.');
      return;
    }

    // Re-check pending state against the source of truth
    const pendingNow = (allShiftsRaw || []).some((raw) => {
      const s = {
        ...raw,
        shiftDate: normalizeYMD(raw?.shiftDate),
        shiftStartTime: normalizeHM(raw?.shiftStartTime),
        shiftEndTime: raw?.shiftEndTime ? normalizeHM(raw.shiftEndTime) : '',
        shiftRole: safeStr(raw?.shiftRole).toLowerCase(),
        status: safeStr(raw?.status),
      };
      return (
        s.shiftDate === editing.key.date &&
        normalizeHM(s.shiftStartTime || '') === editing.key.start &&
        normalizeHM(s.shiftEndTime || '') === editing.key.end &&
        safeStr(s.shiftRole || '') === safeStr(editing.key.role || '') &&
        isPending(s)
      );
    });
    if (pendingNow) {
      Alert.alert('Awaiting approval', 'This shift is already pending approval.');
      return;
    }

    const changed = newStart !== editing.key.start || newEnd !== editing.key.end;
    if (!changed) {
      setEditing(null);
      return;
    }

    setSaving(true);
    try {
      const updated = (allShiftsRaw || []).map((raw) => {
        const s = {
          ...raw,
          shiftDate: normalizeYMD(raw?.shiftDate),
          shiftStartTime: normalizeHM(raw?.shiftStartTime),
          shiftEndTime: raw?.shiftEndTime ? normalizeHM(raw.shiftEndTime) : '',
          shiftRole: safeStr(raw?.shiftRole).toLowerCase(),
          status: safeStr(raw?.status),
        };

        const match =
          s.shiftDate === editing.key.date &&
          normalizeHM(s.shiftStartTime || '') === editing.key.start &&
          normalizeHM(s.shiftEndTime || '') === editing.key.end &&
          safeStr(s.shiftRole || '') === safeStr(editing.key.role || '');

        if (!match) return raw;

        // Do NOT overwrite live times—stash proposed change under `request`
        return {
          ...raw,
          request: {
            shiftStartTime: newStart,
            shiftEndTime: newEnd,
            prevStartTime: s.shiftStartTime ?? null,
            prevEndTime: s.shiftEndTime ?? null,
            requestedAt: firestore.Timestamp.now(),
          },
          status: 'pending',
        };
      });

      await firestore().collection('UsersDetail').doc(userDocId).update({ shifts: updated });

      setAllShiftsRaw(updated);
      setMyWeekShifts(computeWeek(updated));
      setEditing(null);
      Alert.alert('Request sent', 'Your time change has been sent for approval.');
    } catch (e) {
      console.error('Save edit failed', e);
      Alert.alert('Save failed', 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- FlatList Renderers ---------------- */
  const ListHeader = () => (
    <View>
      <Text style={styles.title}>Timesheet</Text>

      <View style={styles.dateRangeContainer}>
        <TouchableOpacity onPress={handlePrevWeek} accessibilityLabel="Previous week">
          <Icon name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.dateRangeText} numberOfLines={1}>{fmtRange(weekStart, weekEnd)}</Text>
        <TouchableOpacity onPress={handleNextWeek} accessibilityLabel="Next week">
          <Icon name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: hp(2) }}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Unassigned days (this week)</Text>
          {loading ? <ActivityIndicator size="small" color={primarycolor} /> : null}
        </View>

        {unassignedDays.length === 0 ? (
          <Text style={styles.muted}>You have at least one shift every day this week.</Text>
        ) : (
          <View style={styles.chipsWrap}>
            {unassignedDays.map(({ key, date }) => (
              <View key={key} style={styles.chip}>
                <Text style={styles.chipTitle}>{weekdayLabel(date)}</Text>
                <Text style={styles.chipSub}>{key}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>My assigned shifts (this week)</Text>
    </View>
  );

  const ListFooter = () => (
    <View style={[styles.footerRow, { flexDirection: 'column', alignItems: 'stretch', gap: 8, paddingTop: hp(1.5) }]}>
      <Text style={styles.totalHours}>Total working hours: <Text style={{ fontWeight: '700' }}>{totalHours} hr</Text></Text>

    </View>
  );

  const renderItem = ({ item, index }) => {
    const { start } = parseShiftToRange(item);
    const dateStr = item.shiftDate || (start ? ymd(start) : '');
    const timeStr = `${item.shiftRole || 'Shift'} • ${time12h(item.shiftStartTime)}${item.shiftEndTime ? ` – ${time12h(item.shiftEndTime)}` : ''}`;

    const rowIsEditing = editing?.idx === index;

    return (
      <View style={[styles.elevatedBox, { marginBottom: hp(1.2) }]}>
        {/* Row details */}
        <View style={{flexDirection:'row',justifyContent:'space-between'}}><Text>Sr.No</Text><Text>{index + 1}</Text></View>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}><Text>Date</Text><Text>{dateStr}</Text></View>
        <View style={{flexDirection:'row',justifyContent:'space-between', alignItems:'center'}}>
          <Text>Shift</Text>
          <View style={{ maxWidth: wp(65), alignItems:'flex-end' }}>
            <Text numberOfLines={1} style={{ textAlign: 'right' }}>{timeStr}</Text>
            {/* If pending & has request, show the proposed times */}
            {isPending(item) && item.request && (item.request.shiftStartTime || item.request.shiftEndTime) ? (
              <Text style={{ color:'#92400E', fontSize:12, marginTop: 2 }}>
                Requested: {time12h(item.request.shiftStartTime || item.shiftStartTime)}
                {item.request.shiftEndTime ? ` – ${time12h(item.request.shiftEndTime)}` : ''}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}><Text>Hours</Text><Text>{fmtHours(shiftHours(item))} hr</Text></View>
        <View style={{flexDirection:'row',justifyContent:'space-between', alignItems:'center'}}>
          <Text>Status</Text>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Text>
              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Assigned'}
            </Text>
            {isPending(item) && (
              <View style={{ marginLeft: 8, backgroundColor:'#FFFBEB', borderColor:'#FBBF24', borderWidth:1, paddingHorizontal:8, paddingVertical:2, borderRadius:12 }}>
                <Text style={{ fontSize:12, color:'#92400E' }}>Awaiting approval</Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions / Editor */}
        {!rowIsEditing ? (
          <View style={{ marginTop: 10, alignItems:'flex-end' }}>
            {isPending(item) ? (
              <View />
            ) : (
              <TouchableOpacity onPress={() => beginEdit(index)} style={[styles.smallBtn, { borderColor: primarycolor }]}>
                <Text style={{ color: primarycolor, fontWeight:'600' }}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={{ marginTop: 12, gap: 10 }}>
            {/* Simple time steppers (15-min increments) */}
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
              <Text style={{ fontSize:13, color:'#374151' }}>Start</Text>
              <View style={styles.stepper}>
                <TouchableOpacity onPress={() => setEditing(p => ({ ...p, start: stepHM(p.start, -15) }))}>
                  <AntDesign name="minus" size={18} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{time12h(editing.start)}</Text>
                <TouchableOpacity onPress={() => setEditing(p => ({ ...p, start: stepHM(p.start, +15) }))}>
                  <AntDesign name="plus" size={18} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
              <Text style={{ fontSize:13, color:'#374151' }}>End</Text>
              <View style={styles.stepper}>
                <TouchableOpacity onPress={() => setEditing(p => ({ ...p, end: stepHM(p.end, -15) }))}>
                  <AntDesign name="minus" size={18} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{time12h(editing.end)}</Text>
                <TouchableOpacity onPress={() => setEditing(p => ({ ...p, end: stepHM(p.end, +15) }))}>
                  <AntDesign name="plus" size={18} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection:'row', justifyContent:'flex-end', gap: 10 }}>
              <TouchableOpacity disabled={saving} onPress={cancelEdit} style={[styles.smallBtn, { borderColor:'#9CA3AF' }]}>
                <Text style={{ color:'#374151', fontWeight:'600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={saving}
                onPress={saveEdit}
                style={[styles.smallBtnFilled, saving && { opacity: 0.6 }]}
              >
                <Text style={{ color:'#fff', fontWeight:'700' }}>{saving ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header Bar */}
      <View style={styles.HeaderCtn}>
        <AntDesign name="home" size={24} color="white" />
        <Text style={[styles.Heading, { marginVertical: 0, marginLeft: wp(10) }]}>VantageCare</Text>
      </View>

      {/* Single vertical FlatList */}
      <FlatList
        data={myWeekShifts}
        keyExtractor={(item, idx) => String(item?.id || `${item?.shiftDate}-${item?.shiftStartTime}-${idx}`)}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={
          error ? (
            <Text style={[styles.muted, { color: '#D11A2A', paddingVertical: hp(1), paddingHorizontal: wp(5) }]}>{error}</Text>
          ) : (
            <View style={[styles.rowItem, styles.rowBase, { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, marginHorizontal: wp(5) }]}>
              <Text style={styles.muted}>No assigned shifts this week.</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingHorizontal: wp(5), paddingBottom: hp(4) }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
      />

      {/* Footer actions */}
      <View style={{ flexDirection: 'row', marginBottom: hp(5), justifyContent: 'space-around', marginTop: 'auto' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.textbtn, { marginRight: hp(1) }]}>Messages</Text>
          <Feather name="bell" size={22} color={primarycolor} />
        </View>
        <TouchableOpacity onPress={logoutUser} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.textbtn, { marginRight: hp(1) }]}>LogOut</Text>
          <MaterialIcons name="logout" size={22} color={primarycolor} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/* --------------------------------------------------------------
   Styles
-------------------------------------------------------------- */
const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flex: 1,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  HeaderCtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(100),
    height: hp(6),
    backgroundColor: primarycolor,
  },
  Heading: {
    fontSize: 26,
    fontWeight: '600',
    marginVertical: hp('2%'),
    fontFamily: 'sans-serif',
    color: 'white',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: hp(2),
    marginBottom: hp(2),
    color: '#000',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: primarycolor,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: 8,
    marginBottom: hp(2),
  },
  dateRangeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
    maxWidth: wp(70),
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: hp(1),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muted: { color: '#6B7280', fontSize: 14 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: {
    borderWidth: 1,
    borderColor: '#FBBF24',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipTitle: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  chipSub: { fontSize: 11, color: '#B45309' },

  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
  },
  rowBase: { backgroundColor: '#FFFFFF' },

  footerRow: { marginTop: hp(1.5) },
  totalHours: { fontSize: 16, fontWeight: '500', color: '#000', marginBottom: 8 },
  primaryBtn: {
    backgroundColor: primarycolor,
    height: hp(5),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  btnText: { fontSize: 16, fontWeight: '600', color: 'white' },
  textbtn: { fontSize: 20, fontWeight: '400', fontFamily: 'sans-serif', color: primarycolor },

  elevatedBox: {
    borderRadius: 15,
    padding: hp(1.2),
    backgroundColor: '#fff',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },

  smallBtn: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  smallBtnFilled: {
    backgroundColor: primarycolor,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  stepper: {
    flexDirection:'row',
    alignItems:'center',
    borderWidth:1,
    borderColor:'#E5E7EB',
    borderRadius:10,
    paddingHorizontal:10,
    paddingVertical:6,
    gap:12,
  },
  stepperValue: { minWidth: 86, textAlign:'center', fontWeight:'600', color:'#111827' },
});

export default TimeSheet;
