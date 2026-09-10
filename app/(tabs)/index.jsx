import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuthContext } from '../../context/AuthContext';
import { useVisitService } from '../../hooks/useVisitService';

export default function DashboardScreen() {
  const { user } = useAuthContext();
  const visitService = useVisitService();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData(true);
  }, []);

  const loadDashboardData = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const data = await visitService.getVisits();
      setVisits(data || []);
    } catch (error) {
      console.log('Error loading dashboard visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(false);
    setRefreshing(false);
  };

  // Compute Statistics
  const completedVisits = visits.filter((v) => v.status === 'completed');
  const activeVisits = visits.filter((v) => v.status === 'in-progress');
  const latestActiveVisit = activeVisits.length > 0 ? activeVisits[0] : null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4f46e5']} />}
      >
        {/* Employee Greeting Header */}
        <View style={styles.greetingHeader}>
          <Text style={styles.greetingTitle}>Good morning, {user?.name || 'Field Officer'}</Text>
          <Text style={styles.greetingSub}>Ready for your field visits today?</Text>
        </View>

        {/* TODAY SUMMARY CARD */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeader}>TODAY'S ATTENDANCE SUMMARY</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: '#16a34a' }]}>{completedVisits.length}</Text>
              <Text style={styles.metricLabel}>Completed</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: '#d97706' }]}>{activeVisits.length}</Text>
              <Text style={styles.metricLabel}>In-Progress</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{visits.length}</Text>
              <Text style={styles.metricLabel}>Total Logged</Text>
            </View>
          </View>
        </View>

        {/* ACTIVE VISIT BANNER (if an active visit exists) */}
        {latestActiveVisit ? (
          <View style={styles.activeVisitBanner}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE VISIT IN-PROGRESS</Text>
            </View>

            <Text style={styles.activeTitle}>{latestActiveVisit.title}</Text>
            <Text style={styles.activeSub}>📍 {latestActiveVisit.location || 'Location Captured'}</Text>

            <View style={styles.checkListRow}>
              <Text style={styles.checkItem}>Location ✓</Text>
              <Text style={styles.checkItem}>
                Customer {latestActiveVisit.contactName ? '✓' : '✕'}
              </Text>
              <Text style={styles.checkItem}>
                Photo {latestActiveVisit.photoUri ? '✓' : '✕'}
              </Text>
            </View>

            <Pressable
              style={styles.continueBtn}
              onPress={() => router.push(`/visits/${latestActiveVisit._id}`)}
            >
              <Text style={styles.continueBtnText}>Continue Visit →</Text>
            </Pressable>
          </View>
        ) : null}

        {/* ONE OBVIOUS PRIMARY ACTION: START NEW VISIT */}
        <Pressable style={styles.primaryActionBtn} onPress={() => router.push('/visit-flow')}>
          <View style={styles.primaryActionInner}>
            <Text style={styles.primaryActionIcon}>➕</Text>
            <View>
              <Text style={styles.primaryActionTitle}>START NEW VISIT</Text>
              <Text style={styles.primaryActionSub}>Guided 5-step site verification & check-in</Text>
            </View>
          </View>
        </Pressable>

        {/* RECENT VISITS SECTION */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Text style={styles.recentHeaderTitle}>Recent Visits</Text>
            <Pressable onPress={() => router.push('/(tabs)/visits')}>
              <Text style={styles.seeAllText}>View All ({visits.length}) →</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#4f46e5" style={{ marginVertical: 20 }} />
          ) : visits.length > 0 ? (
            visits.slice(0, 3).map((item) => (
              <Pressable key={item._id} style={styles.recentCard} onPress={() => router.push(`/visits/${item._id}`)}>
                <View style={styles.recentCardHeader}>
                  <Text style={styles.recentCardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      item.status === 'completed' ? styles.statusCompleted : styles.statusInProgress,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        item.status === 'completed' ? styles.textCompleted : styles.textInProgress,
                      ]}
                    >
                      {item.status?.toUpperCase() || 'IN-PROGRESS'}
                    </Text>
                  </View>
                </View>

                {item.location ? (
                  <Text style={styles.recentCardLoc} numberOfLines={1}>
                    📍 {item.location}
                  </Text>
                ) : null}

                <View style={styles.recentCardFooter}>
                  <Text style={styles.recentCardDate}>
                    {item.startTime ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                  </Text>
                  <Text style={styles.viewDetailsLink}>View Details →</Text>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyRecentBox}>
              <Text style={styles.emptyText}>No field visits logged today.</Text>
              <Text style={styles.emptySub}>Tap "START NEW VISIT" above to begin your first site check-in.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  greetingHeader: {
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  greetingSub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#f1f5f9',
  },
  activeVisitBanner: {
    backgroundColor: '#fffbeb',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#fde68a',
  },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  activeBadgeText: {
    color: '#b45309',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#78350f',
    marginBottom: 4,
  },
  activeSub: {
    fontSize: 13,
    color: '#92400e',
    marginBottom: 12,
  },
  checkListRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  checkItem: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  continueBtn: {
    backgroundColor: '#d97706',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  primaryActionBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryActionInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryActionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  primaryActionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  primaryActionSub: {
    fontSize: 13,
    color: '#c7d2fe',
    marginTop: 2,
  },
  recentSection: {
    marginTop: 4,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  recentHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  seeAllText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 13,
  },
  recentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recentCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 10,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
  },
  statusInProgress: {
    backgroundColor: '#fef3c7',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textCompleted: {
    color: '#15803d',
  },
  textInProgress: {
    color: '#d97706',
  },
  recentCardLoc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 10,
  },
  recentCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  recentCardDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  viewDetailsLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4f46e5',
  },
  emptyRecentBox: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
});
