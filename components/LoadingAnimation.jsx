import React from 'react';
import { View, Animated } from 'react-native';

export default function LoadingAnimation({ style }) {
    const opacity = new Animated.Value(0.5);

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.5,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[style, { backgroundColor: '#B0B0B0', opacity, marginTop: 10 }]} />
    );
}
