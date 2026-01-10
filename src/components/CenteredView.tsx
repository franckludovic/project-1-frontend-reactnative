import React from 'react';
import { View, StyleSheet } from 'react-native';

type Props = { children: React.ReactNode };

const CenteredView: React.FC<Props> = ({ children }) => (
  <View style={styles.center}>{children}</View>
);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default CenteredView;
