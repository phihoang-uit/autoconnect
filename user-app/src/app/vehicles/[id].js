import { useCallback, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import api from '../../lib/api';

const TABS = ['Thông tin xe', 'Lịch sử sửa chữa', 'Giấy tờ, bảo hiểm', 'Lịch bảo dưỡng'];

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '-'}</Text>
    </View>
  );
}

export default function VehicleDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/vehicles/${id}`);
      setVehicle(data);
    } catch {
      Alert.alert('Lỗi', 'Không tải được thông tin xe');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function confirmDelete() {
    Alert.alert('Xóa xe', `Bạn chắc chắn muốn xóa "${vehicle.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/vehicles/${id}`);
            router.back();
          } catch (err) {
            Alert.alert('Lỗi', err.response?.data?.error || 'Không xóa được xe');
          }
        },
      },
    ]);
  }

  if (loading || !vehicle) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: '#f1f5f9' }} contentContainerStyle={styles.container}>
      {vehicle.image_url ? (
        <Image source={{ uri: vehicle.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imageEmpty]}>
          <Text style={{ fontSize: 48 }}>🚗</Text>
        </View>
      )}

      <Text style={styles.title}>{vehicle.name}</Text>
      {vehicle.plate_number ? <Text style={styles.plate}>{vehicle.plate_number}</Text> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View style={styles.tabs}>
          {TABS.map((name, index) => (
            <Pressable
              key={name}
              onPress={() => setTab(index)}
              style={[styles.tab, tab === index && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === index && styles.tabTextActive]}>{name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {tab === 0 ? (
        <View style={styles.card}>
          <Row label="Hãng xe" value={vehicle.brand} />
          <Row label="Dòng xe" value={vehicle.model} />
          <Row label="Năm sản xuất" value={vehicle.year ? String(vehicle.year) : ''} />
          <Row label="Biển số" value={vehicle.plate_number} />
          <Row label="Số km đã đi" value={`${Number(vehicle.odometer).toLocaleString('vi-VN')} km`} />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.placeholder}>Tính năng này sẽ được làm ở mốc sau.</Text>
        </View>
      )}

      <Pressable
        style={styles.editButton}
        onPress={() => router.push({ pathname: '/vehicles/form', params: { id } })}
      >
        <Text style={styles.editText}>Sửa thông tin xe</Text>
      </Pressable>
      <Pressable style={styles.deleteButton} onPress={confirmDelete}>
        <Text style={styles.deleteText}>Xóa xe</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, paddingBottom: 40 },
  image: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#e2e8f0' },
  imageEmpty: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  plate: { fontSize: 16, fontWeight: '600', color: '#2563eb' },
  tabs: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#e2e8f0' },
  tabActive: { backgroundColor: '#2563eb' },
  tabText: { color: '#334155', fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, gap: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { color: '#64748b' },
  rowValue: { color: '#0f172a', fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  placeholder: { color: '#64748b', textAlign: 'center' },
  editButton: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  editText: { color: '#ffffff', fontWeight: '600' },
  deleteButton: { padding: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#dc2626' },
  deleteText: { color: '#dc2626', fontWeight: '600' },
});

