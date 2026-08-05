import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useScaledTheme, ThemeColors } from '../constants/theme';

export function BackButton() {
  const navigation = useNavigation();
  const { Colors } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
    >
      <ChevronLeft color={Colors.text.primary} size={20} strokeWidth={2} />
    </Pressable>
  );
}

const createStyles = (Colors: ThemeColors) => StyleSheet.create({
  btn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    marginLeft: 4,
  },
  btnPressed: {
    opacity: 0.55,
  },
});
