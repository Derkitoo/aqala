import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useScaledTheme, cardShadow, ThemeColors, type RadiusShape } from '../constants/theme';

export function BackButton() {
  const navigation = useNavigation();
  const { Colors, Radius } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Radius), [Colors, Radius]);

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
    >
      <ChevronLeft color={Colors.text.primary} size={22} strokeWidth={2.5} />
    </Pressable>
  );
}

const createStyles = (Colors: ThemeColors, Radius: RadiusShape) => StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    ...cardShadow(Colors),
  },
  btnPressed: {
    opacity: 0.6,
  },
});
