import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

/**
 * 认证保护 Hook
 * 根据用户登录状态自动重定向到登录页或主页
 */
export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  // const { isAuthenticated } = useAuth();
  const isAuthenticated = false;
  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      // 用户未登录但试图访问受保护的页面，重定向到登录页
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup) {
      // 用户已登录但在登录页，重定向到主页
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);
}
