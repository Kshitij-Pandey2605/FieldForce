import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type CustomButtonProps = {
  title: string;
  onPress?: () => void;
};

export default function CustomButton({ title, onPress }: CustomButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
});
