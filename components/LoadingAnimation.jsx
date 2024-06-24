import React, { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';

export default function LoadingAnimation({ style }) {
    const opacity = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        const loop = Animated.loop(
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
        );
        loop.start();
        return () => loop.stop();
    }, [opacity]);

    return (
        <Animated.View style={[style, { backgroundColor: '#31363F', opacity, marginTop: 5 }]} />
    );
}
