import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useVisitService } from '../../hooks/useVisitService';

export default function VisitsScreen() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All'); // 'All' | 'Active' | 'Completed' | 'Pending'
  const visitService = useVisitService();

  useEffect(() => {
    loadVisits(true);
  }, []);

  const loadVisits = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const data = await visitService.getVisits();
      setVisits(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load visits history.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVisits(false);
    setRefreshing(false);
  };

  const filteredVisits = visits.filter((item) => {
    if (filter === 'All') return true;
    if (filter === 'Active' || filter === 'Pending') return item.status === 'in-progress';
    if (filter === 'Completed') return item.status === 'completed';
    return true;
  });

  const renderVisitCard = ({ item }) => {
    const isCompleted = item.status === 'completed';
    return (
      <Pressable style={styles.cardWrapper} onPress={() => router.push(`/visits/${item._id}`)}>
        <View style={styles.visitCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.visitTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={[styles.statusChip, isCompleted ? styles.completedChip : styles.inProgressChip]}>
              <Text style={[styles.statusText, isCompleted ? styles.completedText : styles.inProgressText]}>
                {isCompleted ? '✓ COMPLETED' : '● IN-PROGRESS'}
              </Text>
            </View>
          </View>

          {item.location ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.visitText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          ) : null}

          {item.contactName ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👤</Text>
              <Text style={styles.visitText}>{item.contactName}</Text>
            </View>
          ) : null}

          <View style={styles.cardFooter}>
            <Text style={styles.dateText}>
              {item.startTime ? new Date(item.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Today'}
            </Text>
            <Text style={styles.viewDetailsText}>View Details →</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Visits</Text>
        <Text style={styles.subtitle}>Track your field visits and attendance history</Text>

        <Pressable style={styles.startBtn} onPress={() => router.push('/visit-flow')}>
          <Text style={styles.startBtnText}>+ Start New Visit</Text>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['All', 'Active', 'Completed'].map((tab) => {
          const isActive = filter === tab;
          return (
            <Pressable
              key={tab}
              style={[styles.filterChip, isActive && styles.activeFilterChip]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterText, isActive && styles.activeFilterText]}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Visit List */}
      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredVisits}
          keyExtractor={(item) => item._id}
          renderItem={renderVisitCard}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No visits found</Text>
              <Text style={styles.emptyText}>
                {filter === 'All'
                  ? 'Tap "+ Start New Visit" above to log your first field visit.'
                  : `No ${filter.toLowerCase()} visits recorded.`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 14,
  },
  startBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  startBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFilterChip: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  cardWrapper: {
    marginBottom: 12,
  },
  visitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  visitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 10,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  completedChip: {
    backgroundColor: '#dcfce7',
  },
  inProgressChip: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  completedText: {
    color: '#15803d',
  },
  inProgressText: {
    color: '#d97706',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  visitText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4f46e5',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
