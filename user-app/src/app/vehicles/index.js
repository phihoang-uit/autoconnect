import { useCallback, useState } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../../lib/api';

export default function Vehicles() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được danh sách xe');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function renderItem({ item }) {
    const subtitle = [item.brand, item.model, item.year].filter(Boolean).join(' · ');
    return (
      <Pressable style={styles.card} onPress={() => router.push(`/vehicles/${item.id}`)}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbEmpty]}>
            <Text style={{ fontSize: 28 }}>🚗</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          {item.plate_number ? <Text style={styles.plate}>{item.plate_number}</Text> : null}
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
          <Text style={styles.sub}>{Number(item.odometer).toLocaleString('vi-VN')} km</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.addButton} onPress={() => router.push('/vehicles/form')}>
        <Text style={styles.addText}>+ Thêm xe</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          loading ? null : (
            <Text style={styles.empty}>Chưa có xe nào. Bấm "+ Thêm xe" để bắt đầu.</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f1f5f9' },
  addButton: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  addText: { color: '#ffffff', fontWeight: '600' },
  error: { color: '#dc2626', marginBottom: 8 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 32 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: '#ffffff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  thumb: { width: 84, height: 84, borderRadius: 8, backgroundColor: '#e2e8f0' },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  plate: { fontWeight: '600', color: '#2563eb', marginTop: 2 },
  sub: { color: '#64748b', marginTop: 2 },
});