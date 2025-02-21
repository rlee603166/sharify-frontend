import { View, Image } from "react-native";

const ReceiptPhoto = ({ photoUri }) => {

    return (
        <View>
            <Image 
                source={ uri: photoUri }}
                style={styles.preview} 
                resizeMode="contain" 
            />
        </View>
    );
};
