import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { useAuthContext } from '../../context/AuthContext';

export default function RegisterScreen() {
  const { register, loading } = useAuthContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Validation', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation', 'Passwords do not match.');
      return;
    }

    try {
      await register(name, email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Registration failed', error.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.card}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandIcon}>🚀</Text>
          <Text style={styles.brandTitle}>FieldForce Setup</Text>
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register your employee profile for field attendance tracking</Text>

        <CustomInput label="Employee Full Name" placeholder="e.g. Alex Morgan" value={name} onChangeText={setName} />
        <CustomInput label="Email Address" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <CustomInput label="Password" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
        <CustomInput label="Confirm Password" placeholder="••••••••" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

        <CustomButton
          title={loading ? 'Creating Account...' : 'Register Profile'}
          onPress={handleRegister}
          style={styles.regBtn}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.linkText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0f172a',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  brandIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4338ca',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  regBtn: {
    marginTop: 8,
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  linkText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 14,
  },
});
