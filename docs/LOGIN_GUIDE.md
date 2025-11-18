# 登录功能使用说明

## 概述

本项目已集成完整的用户认证系统，包括登录、登出和路由保护功能。使用了最新的 Expo Router v6 和 TypeScript 类型路由。

## 文件结构

```
app/
  ├── login.tsx                    # 登录页面
  ├── _layout.tsx                  # 根布局（包含路由保护）
  └── (tabs)/
      ├── profile.tsx              # 个人中心页面（展示用户信息和登出功能）
      └── ...

hooks/
  └── auth/
      └── useProtectedRoute.tsx    # 路由保护 Hook

services/
  └── auth/
      └── login.ts                 # 登录/登出服务

store/
  └── authStore.ts                 # 认证状态管理（Zustand + MMKV）

types/
  └── auth.ts                      # 认证相关类型定义
```

## 功能特性

### 1. 登录页面 (`app/login.tsx`)

- ✅ 现代化 UI 设计，支持深色模式
- ✅ 使用 NativeWind (Tailwind CSS) 样式
- ✅ 邮箱格式验证
- ✅ 键盘避让处理
- ✅ 加载状态显示
- ✅ 错误提示
- ✅ 集成 Zustand 状态管理

### 2. 认证状态管理 (`store/authStore.ts`)

使用 Zustand + MMKV 实现持久化状态管理：

```typescript
// 可用的状态和方法
interface AuthState {
  token: string | null;              // JWT token
  authInfo: IAuthInfo | null;        // 解码后的用户信息
  isAuthenticated: boolean;          // 是否已登录
  isLoading: boolean;                // 加载状态
  error: string | null;              // 错误信息
  
  login: (credentials) => Promise<void>;    // 登录
  logout: () => Promise<void>;              // 登出
  setToken: (token) => void;                // 设置 token
  clearError: () => void;                   // 清除错误
}
```

### 3. 路由保护 (`hooks/auth/useProtectedRoute.tsx`)

自动根据登录状态重定向：

- 未登录用户访问受保护页面 → 重定向到登录页
- 已登录用户访问登录页 → 重定向到主页

### 4. 个人中心 (`app/(tabs)/profile.tsx`)

展示用户信息和登出功能：

- 显示用户邮箱、UUID、权限等信息
- 提供登出按钮

## 使用方法

### 在组件中使用认证状态

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { isAuthenticated, authInfo, login, logout } = useAuthStore();
  
  // 检查是否登录
  if (!isAuthenticated) {
    return <Text>请先登录</Text>;
  }
  
  // 使用用户信息
  return <Text>欢迎, {authInfo?.email}</Text>;
}
```

### 手动调用登录

```typescript
import { useAuthStore } from '@/store/authStore';

function LoginComponent() {
  const { login, isLoading, error } = useAuthStore();
  
  const handleLogin = async () => {
    try {
      await login({
        email: 'user@example.com',
        password: 'password123'
      });
      // 登录成功
    } catch (err) {
      // 处理错误
      console.error(err);
    }
  };
}
```

### 登出

```typescript
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

function LogoutButton() {
  const { logout } = useAuthStore();
  const router = useRouter();
  
  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };
  
  return <Button onPress={handleLogout}>登出</Button>;
}
```

## API 集成

登录服务 (`services/auth/login.ts`) 已经配置为使用你现有的 ID Server API：

```typescript
// 自动调用: POST /auth/login
// Body: { email, password }
// Response: { token, available_slot }
```

如需修改 API 端点，请编辑：
- `services/auth/login.ts` - 登录逻辑
- `services/axios/idServer.ts` - API 客户端配置

## 类型安全

所有认证相关的类型都在 `types/auth.ts` 中定义，确保完整的 TypeScript 类型支持：

```typescript
interface IAuthCredentials {
  email?: string;
  password?: string;
  token?: string;
}

interface IAuthInfo {
  createdAt: number;
  email: string;
  exp: number;
  isAdmin: boolean;
  permission: number;
  status: number;
  uuid: string;
}
```

## 数据持久化

使用 MMKV 进行快速、加密的本地存储：

- ✅ Token 自动持久化
- ✅ 用户信息缓存
- ✅ 登录状态保持
- ✅ 应用重启后自动恢复会话

## 安全性

- ✅ JWT token 自动解码和验证
- ✅ Token 过期自动处理
- ✅ 密码输入框安全显示
- ✅ HTTPS 加密传输（生产环境）

## 调试

使用集成的日志系统：

```typescript
import { LOG } from '@/utils/logger/logger';

LOG.info('Login successful');
LOG.error('Login failed', error);
```

## 下一步

1. **自定义登录页面样式** - 编辑 `app/login.tsx`
2. **添加注册功能** - 创建 `app/register.tsx`
3. **忘记密码** - 实现密码重置流程
4. **社交登录** - 集成第三方登录（Google, Apple 等）
5. **生物识别** - 添加指纹/面容 ID 登录

## 故障排除

### 登录后立即跳回登录页

检查 `useProtectedRoute` 的逻辑，确保 `isAuthenticated` 状态正确更新。

### Token 没有持久化

确保 MMKV 正确配置，检查 `authStore.ts` 的 persist 配置。

### TypeScript 错误

运行 `pnpm install` 确保所有依赖已安装，特别是 `jwt-decode` 和相关类型定义。
