import { View, Text, Pressable, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { icons } from '../assets/icons';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const TabBarButton = ({ isFocused, label, routeName, color, onPress, onLongPress }) => {
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(isFocused ? 1 : 0, {
            damping: 18,
            stiffness: 150,
            mass: 0.8
        });
    }, [isFocused]);

    const animatedIconStyle = useAnimatedStyle(() => {
        const scaleValue = interpolate(scale.value, [0, 1], [1.0, 1.15]);

        return {
            transform: [
                { scale: scaleValue }
            ],
        };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scale.value, [0, 1], [0.75, 1.0]);
        const textScale = interpolate(scale.value, [0, 1], [0.95, 1.02]);

        return {
            opacity,
            transform: [
                { scale: textScale }
            ],
        };
    });

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.container}
        >
            <Animated.View style={[animatedIconStyle, styles.iconContainer]}>
                {icons[routeName] ? icons[routeName]({ color }) : <Text>Icon not found</Text>}
            </Animated.View>

            <Animated.Text style={[styles.label, { color }, animatedTextStyle]}>
                {label}
            </Animated.Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 52,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 24,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 3,
    },
});

export default TabBarButton;
