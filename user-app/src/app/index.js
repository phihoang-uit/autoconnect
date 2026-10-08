import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User home</Text>
      <Text style={styles.text}>Xin chào, {profile?.full_name || profile?.email}</Text>

      <Pressable style={styles.menuButton} onPress={() => router.push('/vehicles')}>
        <Text style={styles.menuText}>🚗  Cars passport</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, backgroundColor: '#f1f5f9' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2563eb' },
  text: { color: '#0f172a', marginBottom: 12 },
  menuButton: { backgroundColor: '#ffffff', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  menuText: { color: '#0f172a', fontSize: 16, fontWeight: '600' },
  logoutButton: { backgroundColor: '#1e293b', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 'auto' },
  logoutText: { color: '#ffffff', fontWeight: '600' },
});