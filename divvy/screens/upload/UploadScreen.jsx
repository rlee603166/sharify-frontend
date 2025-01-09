// UploadScreen.js
import { useEffect, useState } from "react";
import PhotoReview from "./PhotoReviewScreen";
import { View, TextInput, Text, TouchableOpacity } from "react-native";

import CameraScreen from "../../components/upload/CameraScreen";
import ContactList from "../../components/main/ContactList";
import LoadingWrapper from "../../components/main/LoadingWrapper";

import ReceiptView from "./ReceiptView";
import ReviewWrapper from "./ReviewWrapper";

import ReceiptService from "../../services/ReceiptService";
import { useUser } from "../../services/UserProvider";

const UploadScreen = ({ navigation }) => {
    const [step, setStep] = useState(0);
    const [photoUri, setPhotoUri] = useState(null);
    const [manualInput, setManualInput] = useState("");
    const [selectedPeople, setSelectedPeople] = useState();
    const [processed, setProcessed] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [inputType, setInputType] = useState(null);
    const [wrapperIsLoading, setWrapperIsLoading] = useState(false);

    const [receiptID, setReceiptID] = useState(null);
    const [apiData, setApiData] = useState({});
    const [ocrData, setOcrData] = useState({});

    const { user_id } = useUser();
    const receiptService = new ReceiptService();

    const handlePictureTaken = (uri, type = "camera") => {
        if (type === "manual") {
            setStep(2);
            setInputType("manual");
        } else {
            setInputType("camera");
            setPhotoUri(uri);
            setStep(1);
        }
    };

    const handleBack = () => {
        if (inputType === "manual") {
            setStep(0);
        } else {
            setStep(1);
        }
    };

    const handleRetake = () => {
        setPhotoUri(null);
        setStep(0);
    };

    const handleAcceptPhoto = async () => {
        try {
            setWrapperIsLoading(true);
            const data = await receiptService.upload(photoUri, user_id);
            setApiData(data);
            console.log(data)
            setStep(2);
        } catch (error) {
            console.log(error);
            setStep(0);
        } finally {
            setWrapperIsLoading(false);
        }
    };

    const onSelectPeople = async selectedItems => {
        setWrapperIsLoading(true);
        setSelectedPeople(selectedItems);

        const MAX_ATTEMPTS = 10;
        const POLLING_INTERVAL = 2000;
        let attempts = 0;

        while (attempts < MAX_ATTEMPTS) {
            try {
                const data = await receiptService.fetchReceipt(apiData.receipt_id);

                if (data.status === "completed") {
                    setOcrData(data.processed_data);
                    setWrapperIsLoading(false);
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
                attempts++;
            } catch (error) {
                console.error("Error fetching receipt:", error);
                setWrapperIsLoading(false);
                return;
            }
        }

        setWrapperIsLoading(false);
        alert("Receipt processing is taking longer than expected. Please try again later.");
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
                    <ContactList
                        setStep={setStep}
                        onSelectPeople={onSelectPeople}
                        type="Next"
                        handleBack={handleBack}
                    />
                );
            case 3:
                return (
                    <ReceiptView
                        isLoading={isLoading}
                        setStep={setStep}
                        onProcessed={onProcessed}
                        selectedPeople={selectedPeople}
                        photoUri={photoUri}
                        ocrData={ocrData}
                    />
                );
            case 4:
                return <ReviewWrapper setStep={setStep} processed={processed} />;
            default:
                return null;
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <LoadingWrapper isLoading={wrapperIsLoading}>{renderStep()}</LoadingWrapper>
        </View>
    );
};

export default UploadScreen;
