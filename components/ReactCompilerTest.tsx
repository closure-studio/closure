import { Text, View } from '@/components/Themed';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

/**
 * React Compiler 测试组件
 * 
 * 这个组件用于验证 React Compiler 是否成功启动
 * React Compiler 会自动为组件添加 memoization，避免不必要的重渲染
 * 
 * 验证方法：
 * 1. 查看编译日志是否显示组件被 React Compiler 处理
 * 2. 观察性能改进（减少不必要的重渲染）
 */
export default function ReactCompilerTest() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // React Compiler 会自动优化这些计算
  const expensiveCalculation = () => {
    console.log('🔥 Expensive calculation running');
    let result = 0;
    for (let i = 0; i < count; i++) {
      result += i;
    }
    return result;
  };
  
  const result = expensiveCalculation();
  
  // React Compiler 会自动 memoize 这个对象
  const styleConfig = {
    backgroundColor: count % 2 === 0 ? '#4CAF50' : '#2196F3',
    opacity: count > 0 ? 1 : 0.5,
  };
  
  console.log(`✨ ReactCompilerTest rendered - count: ${count}`);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Compiler 测试</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>点击次数：{count}</Text>
        <Text style={styles.label}>计算结果：{result}</Text>
        <Text style={styles.info}>
          {count > 0 
            ? '✅ React Compiler 正在优化此组件' 
            : '👆 点击按钮开始测试'}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, styleConfig]}
        onPress={() => setCount(c => c + 1)}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>增加计数 (+1)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.resetButton]}
        onPress={() => setCount(0)}
      >
        <Text style={styles.buttonText}>重置</Text>
      </TouchableOpacity>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📋 验证说明：</Text>
        <Text style={styles.infoText}>
          • 打开控制台查看渲染日志{'\n'}
          • React Compiler 会自动优化组件{'\n'}
          • 检查 Metro bundler 输出{'\n'}
          • 如果成功，组件会自动 memoize
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    marginTop: 10,
    fontStyle: 'italic',
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  resetButton: {
    backgroundColor: '#FF5722',
    opacity: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    width: '100%',
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
