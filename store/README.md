# 全局状态管理

本项目使用 Zustand + MMKV 实现全局状态管理。

## 使用方法

### 基础用法

```tsx
import { useGlobalStore } from '@/store/useGlobalStore';

function MyComponent() {
  // 获取整个 store
  const { user, setUser } = useGlobalStore();
  
  // 或者只订阅特定字段（性能更好）
  const user = useGlobalStore((state) => state.user);
  const setUser = useGlobalStore((state) => state.setUser);
  
  return (
    <View>
      <Text>{user?.name}</Text>
      <Button onPress={() => setUser({ id: '1', name: 'Jack', email: 'jack@example.com' })}>
        设置用户
      </Button>
    </View>
  );
}
```

### 使用 Selectors（推荐）

```tsx
import { useGlobalStore, selectUser, selectSettings } from '@/store/useGlobalStore';

function MyComponent() {
  const user = useGlobalStore(selectUser);
  const settings = useGlobalStore(selectSettings);
  
  return <Text>{user?.name}</Text>;
}
```

### 在非组件中使用

```tsx
import { useGlobalStore } from '@/store/useGlobalStore';

// 直接获取状态
const user = useGlobalStore.getState().user;

// 设置状态
useGlobalStore.getState().setUser({ id: '1', name: 'Jack', email: 'jack@example.com' });
```

## API

### 状态字段

- `user`: 用户信息对象
- `token`: 认证 token
- `settings`: 应用设置（主题、语言、通知等）
- `businessData`: 业务数据
- `isLoading`: 全局加载状态

### Actions

- `setUser(user)`: 设置用户信息
- `clearUser()`: 清除用户信息
- `setToken(token)`: 设置认证 token
- `clearToken()`: 清除 token
- `updateSettings(settings)`: 更新设置
- `setBusinessItems(items)`: 设置业务数据列表
- `selectItem(id)`: 选择某个业务项
- `addBusinessItem(item)`: 添加业务项
- `removeBusinessItem(id)`: 删除业务项
- `setLoading(isLoading)`: 设置加载状态
- `reset()`: 重置所有状态

## 特性

- ✅ 使用 MMKV 进行持久化存储（比 AsyncStorage 快得多）
- ✅ TypeScript 类型安全
- ✅ 自动持久化（用户、token、设置等）
- ✅ 支持选择性订阅，优化性能
- ✅ 支持在组件外使用

## 自定义

根据你的业务需求，修改 `useGlobalStore.ts` 中的：
- `GlobalState` 接口：添加你需要的状态字段
- `GlobalActions` 接口：添加你需要的操作方法
- `partialize` 配置：选择哪些字段需要持久化
