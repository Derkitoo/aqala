import { Alert, Platform } from 'react-native';

interface ConfirmButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

/**
 * Alert.alert() is a no-op on web (react-native-web ships an empty stub),
 * so any confirm/alert dialog silently did nothing there. Falls back to
 * window.confirm/alert on web, real Alert.alert on native.
 */
export function showConfirm(title: string, message: string, buttons: ConfirmButton[]) {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    const button = confirmed
      ? buttons.find(b => b.style !== 'cancel')
      : buttons.find(b => b.style === 'cancel');
    button?.onPress?.();
    return;
  }
  Alert.alert(title, message, buttons);
}

export function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
