import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type VisitCardProps = {
  title: string;
  subtitle?: string;
  status?: string;
};

export default function VisitCard({ title, subtitle, status }: VisitCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#4b5563',
  },
  status: {
    marginTop: 8,
    color: '#2563eb',
    fontWeight: '600',
  },
});
