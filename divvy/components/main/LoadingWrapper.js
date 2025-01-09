import { View, StyleSheet, ActivityIndicator } from "react-native";
import theme from "../../theme/index";

const LoadingWrapper = ({ children, isLoading }) => {
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return children;
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});

export default LoadingWrapper;
