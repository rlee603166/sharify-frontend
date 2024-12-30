// UploadScreen.js
import { useEffect, useState } from "react";
import CameraScreen from "../../components/upload/CameraView";
import PhotoReview from "./PhotoReviewScreen";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import ContactList from "../../components/main/ContactList";
import ReceiptView from "./ReceiptView";
import ReviewWrapper from "./ReviewWrapper";

const UploadScreen = ({ navigation }) => {
    const [step, setStep] = useState(0);
    const [photoUri, setPhotoUri] = useState(null);
    const [manualInput, setManualInput] = useState("");
    const [selectedPeople, setSelectedPeople] = useState();
    const [processed, setProcessed] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handlePictureTaken = (uri, type = "camera") => {
        if (type === "manual") {
            setStep(3);
        } else {
            setPhotoUri(uri);
            setStep(1);
        }
    };

    const handleRetake = () => {
        setPhotoUri(null);
        setStep(0);
    };

    const handleAcceptPhoto = () => {
        setStep(2);
    };

    const handleManualSubmit = () => {
        if (manualInput.trim()) {
            setStep(2);
        }
    };

    const onSelectPeople = selectedItems => {
        setSelectedPeople(selectedItems);
    };

    const onProcessed = processedReceipt => {
        setProcessed(processedReceipt);
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return <CameraScreen onPictureTaken={handlePictureTaken} />;
            case 1:
                return (
                    <PhotoReview
                        photoUri={photoUri}
                        onRetake={handleRetake}
                        onAccept={handleAcceptPhoto}
                    />
                );
            case 2:
                return (
                    <ContactList setStep={setStep} onSelectPeople={onSelectPeople} type="Next" />
                );
            case 3:
                return (
                    <ReceiptView
                        isLoading={isLoading}
                        setStep={setStep}
                        onProcessed={onProcessed}
                        selectedPeople={selectedPeople}
                    />
                );
            case 4:
                return <ReviewWrapper setStep={setStep} processedReceipt={processed} />;
            default:
                return null;
        }
    };

    return <View style={{ flex: 1 }}>{renderStep()}</View>;
};

export default UploadScreen;
