import * as Contacts from 'expo-contacts';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');

      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        const sorted = (data || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setContacts(sorted);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to retrieve device contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert(
        'Platform Limitation',
        'Adding contacts via native form is supported on iOS devices. Use your device Contacts app to add contacts.'
      );
      return;
    }
    try {
      await Contacts.presentFormAsync(null, {});
      await loadContacts();
    } catch (error) {
      Alert.alert('Error', 'Unable to open contact form');
    }
  };

  const handleSelectCustomer = (contact) => {
    Alert.alert(
      'Start Visit with Customer',
      `Would you like to start a field visit for ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Visit →',
          onPress: () => router.push('/visit-flow'),
        },
      ]
    );
  };

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    return contacts.filter((c) => (c.name || '').toLowerCase().includes(search.toLowerCase()));
  }, [search, contacts]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading customer directory...</Text>
      </View>
    );
  }

  if (permissionGranted === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Contacts Access Denied</Text>
        <Text style={styles.message}>
          Please grant contacts permission in device settings to manage customer contacts.
        </Text>
        <Pressable style={styles.primaryButton} onPress={loadContacts}>
          <Text style={styles.primaryButtonText}>Retry Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Customers</Text>
          <Text style={styles.subtitle}>Select and manage customer contacts</Text>
        </View>
        <Pressable style={styles.addButton} onPress={handleAddContact}>
          <Text style={styles.addButtonText}>+ Add Contact</Text>
        </Pressable>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="🔍 Search customers by name..."
        placeholderTextColor="#94a3b8"
        style={styles.searchInput}
      />

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => {
          const phone = item.phoneNumbers && item.phoneNumbers[0] ? item.phoneNumbers[0].number : 'No Phone Number';
          return (
            <View style={styles.contactCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || '👤'}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>📞 {phone}</Text>
              </View>

              <Pressable style={styles.selectBtn} onPress={() => handleSelectCustomer(item)}>
                <Text style={styles.selectBtnText}>Select →</Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No customer contacts found</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  message: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 10,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#4338ca',
    fontWeight: '800',
    fontSize: 16,
  },
  contactName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#0f172a',
  },
  contactPhone: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  selectBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  selectBtnText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 24,
    fontSize: 14,
  },
});
