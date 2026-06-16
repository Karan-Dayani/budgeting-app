import { View, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import TabBarButton from './TabBarButton';
import { useTheme } from "expo-router/react-navigation";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const TabBar = ({ state, descriptors, navigation }) => {
    const { colors, dark } = useTheme();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const filteredRoutes = state.routes.filter(
        route => !['_sitemap', '+not-found'].includes(route.name)
    );

    const routesCount = filteredRoutes.length;
    const tabWidth = dimensions.width ? dimensions.width / routesCount : 0;
    
    const tabPositionX = useSharedValue(0);

    const activeIndex = filteredRoutes.findIndex(route => {
        return state.routes[state.index].name === route.name;
    });

    useEffect(() => {
        if (tabWidth > 0 && activeIndex !== -1) {
            tabPositionX.value = withSpring(activeIndex * tabWidth, {
                damping: 20,
                stiffness: 150,
                mass: 0.8
            });
        }
    }, [activeIndex, tabWidth]);

    const onTabbarLayout = (e) => {
        const { width, height } = e.nativeEvent.layout;
        setDimensions({ width, height });
    };

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: tabPositionX.value }],
            width: tabWidth - 16,
            left: 8,
        };
    });

    return (
        <View 
            onLayout={onTabbarLayout}
            style={[
                styles.tabbar, 
                { 
                    backgroundColor: colors.tabBarBgColor,
                    borderColor: 'rgba(255, 255, 255, 0.06)',
                    borderWidth: 1,
                }
            ]}
        >
            {dimensions.width > 0 && (
                <Animated.View
                    style={[
                        styles.indicator,
                        {
                            backgroundColor: 'rgba(65, 179, 162, 0.14)',
                            borderColor: 'rgba(65, 179, 162, 0.25)',
                            borderWidth: 1,
                            height: dimensions.height - 16,
                            top: 8,
                        },
                        animatedIndicatorStyle,
                    ]}
                />
            )}

            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                if (['_sitemap', '+not-found'].includes(route.name)) return null;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <TabBarButton
                        key={route.name}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        isFocused={isFocused}
                        routeName={route.name}
                        color={isFocused ? colors.tabBarBtActive : colors.tabBarBtInActive}
                        label={label}
                    />
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    tabbar: {
        position: 'absolute',
        bottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 12,
        shadowOpacity: 0.1,
        elevation: 6,
    },
    indicator: {
        position: 'absolute',
        borderRadius: 16,
    }
});

export default TabBar