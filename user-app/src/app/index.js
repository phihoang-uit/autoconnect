import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { profile, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User home</Text>
      <Text style={{ color: '#0f172a' }}>Xin chào, {profile?.full_name || profile?.email}</Text>
      <Text style={{ color: '#0f172a' }}>Vai trò: {profile?.role}</Text>
      <Pressable style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: '#f1f5f9' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2563eb' },
  button: { backgroundColor: '#1e293b', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginTop: 12 },
  buttonText: { color: 'white', fontWeight: '600' },
});

