import { Component, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Release builds never show React's red error overlay, so an uncaught render error otherwise
 * leaves a blank/gray window with no clue what happened. This is the last line of defense —
 * plain RN components only, no theme/DB dependency, so it still renders even if the crash came
 * from ThemeProvider or the database layer itself.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('RITMO crashed:', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' }}>
          Algo salió mal
        </Text>
        <ScrollView style={{ maxHeight: 220, marginBottom: 20 }}>
          <Text style={{ color: '#9A9A9A', fontSize: 13, textAlign: 'center' }}>{error.message}</Text>
        </ScrollView>
        <Pressable
          onPress={this.reset}
          style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999 }}
        >
          <Text style={{ color: '#000000', fontWeight: '600' }}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }
}
