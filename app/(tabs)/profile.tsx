import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/database';
import { Settings, LogOut, ShieldCheck } from 'lucide-react-native';
import { COLORS } from '@/theme/colors';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProfile();
      checkAdmin();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data as UserProfile);
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAdmin = async () => {
    try {
      const { data } = await supabase
        .from('admin_users')
        .select('is_admin')
        .eq('id', user!.id)
        .maybeSingle();

      if (data?.is_admin) {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user!.id,
          full_name: fullName,
          phone,
        });

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
      loadProfile();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/(auth)/login');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Card */}
        <View style={styles.section}>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{fullName || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Admin Section */}
        {isAdmin && (
          <View style={styles.section}>
            <View style={styles.adminBanner}>
              <ShieldCheck size={24} color={COLORS.primary} />
              <View style={styles.adminText}>
                <Text style={styles.adminTitle}>Admin Access</Text>
                <Text style={styles.adminDesc}>Access the admin dashboard to manage products and categories</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => {
                router.push('/admin');
              }}
            >
              <Text style={styles.adminButtonText}>Go to Admin Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Edit Profile Section */}
        {!editing ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{fullName || 'Not provided'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{phone || 'Not provided'}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Settings size={20} color="#fff" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              editable={!updating}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!updating}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setEditing(false);
                  loadProfile();
                }}
                disabled={updating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, updating && styles.buttonDisabled]}
                onPress={handleUpdateProfile}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', onPress: () => {} },
                  { text: 'Sign Out', onPress: handleSignOut, style: 'destructive' },
                ]
              );
            }}
          >
            <LogOut size={20} color="#f44" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  adminBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF5E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  adminText: {
    flex: 1,
    marginLeft: 12,
  },
  adminTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  adminDesc: {
    fontSize: 12,
    color: COLORS.primary,
    lineHeight: 16,
  },
  adminButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: COLORS.background,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signOutButton: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f44',
  },
  signOutText: {
    color: '#f44',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
});
