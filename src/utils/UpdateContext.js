/**
 * 热更新上下文 - Cresc (react-native-update)
 * AppKey: zTmIBVr3nDOIxVx3QXpk421y
 */

import { Platform, Alert, Linking } from 'react-native';

const appKey = Platform.OS === 'ios' 
  ? 'YOUR_IOS_APP_KEY' 
  : 'zTmIBVr3nDOIxVx3QXpk421y';

const APP_NAME = '灵枢排盘';

/**
 * 检查更新
 * @param {boolean} showResult 是否显示结果提示
 */
export async function checkForUpdate(showResult = false) {
  try {
    const Update = require('react-native-update').default;
    const result = await Update.checkForUpdate(appKey);
    
    if (result.update) {
      const { update } = result;
      
      if (showResult) {
        Alert.alert(
          '发现新版本',
          `版本：${update.version}\n${update.note || ''}`,
          [
            { text: '取消', style: 'cancel' },
            { 
              text: '更新', 
              onPress: () => downloadAndInstallUpdate(update) 
            },
          ]
        );
      }
      
      return result;
    } else {
      if (showResult) {
        Alert.alert('提示', '已是最新版本');
      }
      return null;
    }
  } catch (error) {
    console.log('检查更新失败:', error);
    if (showResult) {
      Alert.alert('提示', '检查更新失败');
    }
    return null;
  }
}

/**
 * 下载并立即安装更新
 */
export async function downloadAndInstallUpdate(update) {
  try {
    const Update = require('react-native-update').default;
    
    Alert.alert('更新中', '正在下载更新包，请稍候...');
    
    await Update.downloadAndInstallUpdate(appKey, update, {
      onProgress: (progress) => {
        console.log('下载进度:', progress);
      },
    });
    
    Alert.alert('更新成功', '应用已更新到最新版本');
  } catch (error) {
    console.log('更新失败:', error);
    Alert.alert('更新失败', error.message);
  }
}

/**
 * 下载更新，下次启动时生效
 */
export async function downloadUpdateForNextLaunch(update) {
  try {
    const Update = require('react-native-update').default;
    await Update.downloadUpdateForNextLaunch(appKey, update);
    Alert.alert('提示', '更新包已下载，下次启动时生效');
  } catch (error) {
    console.log('下载更新失败:', error);
  }
}

/**
 * 检查是否是第一次启动（热更新后）
 */
export async function checkFirstTime() {
  try {
    const Update = require('react-native-update').default;
    const isFirstTime = await Update.isFirstTime();
    
    if (isFirstTime) {
      console.log('热更新后第一次启动');
      Alert.alert(
        '更新完成',
        `${APP_NAME} 已更新到最新版本`,
        [{ text: '好的' }]
      );
    }
  } catch (error) {
    console.log('检查第一次启动失败:', error);
  }
}

/**
 * 检查是否回滚
 */
export async function checkRollback() {
  try {
    const Update = require('react-native-update').default;
    const isRolledBack = await Update.isRolledBack();
    
    if (isRolledBack) {
      console.log('应用已回滚');
      Alert.alert(
        '提示',
        '检测到应用回滚到之前的版本',
        [{ text: '好的' }]
      );
    }
  } catch (error) {
    console.log('检查回滚失败:', error);
  }
}

/**
 * 自动检查更新（静默检查）
 */
export async function autoCheckUpdate() {
  try {
    const result = await checkForUpdate(false);
    
    if (result && result.update) {
      // 有新版本，提示用户
      const { update } = result;
      
      Alert.alert(
        '发现新版本',
        `版本：${update.version}\n${update.note || ''}`,
        [
          { text: '稍后', style: 'cancel' },
          { 
            text: '更新', 
            onPress: () => downloadAndInstallUpdate(update) 
          },
        ]
      );
    }
  } catch (error) {
    console.log('自动检查更新失败:', error);
  }
}

export default {
  checkForUpdate,
  downloadAndInstallUpdate,
  downloadUpdateForNextLaunch,
  checkFirstTime,
  checkRollback,
  autoCheckUpdate,
};
