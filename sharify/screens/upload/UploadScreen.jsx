// UploadScreen.js
import { useEffect, useState, useRef } from "react";
import PhotoReview from "./PhotoReviewScreen";
import { View } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

import CameraScreen from "../../components/upload/CameraScreen";
import ContactList from "../../components/main/ContactList";
import LoadingWrapper from "../../components/main/LoadingWrapper";
import ReceiptView from "./ReceiptView";
import ReviewWrapper from "./ReviewWrapper";

import ReceiptService from "../../services/ReceiptService";
import UserService from "../../services/UserService";

import { useUser } from "../../services/UserProvider";
import { useFriends } from "../../hooks/useFriends";
import { useGroups } from "../../context/GroupsContext";

const UploadScreen = ({ navigation }) => {
    const [step, setStep] = useState(0);
    const [photoUri, setPhotoUri] = useState(null);
    const [selectedPeople, setSelectedPeople] = useState();
    const [processed, setProcessed] = useState({});
    const [peopleHashMap, setPeopleHashMap] = useState({});
    const [inputType, setInputType] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [receiptID, setReceiptID] = useState(null);
    const receiptIDRef = useRef(null);
    const [apiData, setApiData] = useState({});
    const [ocrData, setOcrData] = useState({});
    const [receiptItems, setReceiptItems] = useState([]);
    const [receiptTotal, setReceiptTotal] = useState(0);

    const { id } = useUser();
    const { friends, loadFriends } = useFriends();
    const { groups, loadGroups } = useGroups();
    const receiptService = new ReceiptService();
    const userService = new UserService();

    useEffect(() => {
        loadFriends(id);
        loadGroups(id);
    }, []);

    useEffect(() => {
        console.log(`step: ${step}`);
    }, [step]);

    useEffect(() => {
        console.log(`photo uri: ${photoUri}`);
    }, [photoUri]);

    useEffect(() => {
        console.log(`receipt id: ${receiptID}`);
    }, [receiptID]);

    const optimizer = async uri => {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 750 } }],
            { compress: 0.9, format: "webp" }
        );
        return result.uri;
    };

    const uploadReceipt = async uri => {
        const optimizedUri = await optimizer(uri);
        console.log(`optimized uri: ${optimizedUri}`);
        const data = await receiptService.upload(optimizedUri);
        console.log(`api response: ${JSON.stringify(data, null, 2)}`);
        setReceiptID(data.receipt_id);
    };

    const handlePictureTaken = (uri, type = "camera") => {
        setInputType(type);
        if (type == "manual") {
            setStep(2);
        } else {
            uploadReceipt(uri);
            setPhotoUri(uri);
            setStep(1);
        }
    };

    const handleBack = () => {
        if (inputType == "manual") {
            reset();
            setStep(0);
            return;
        }
        if (step === 3) {
            setReceiptItems(prevItems =>
                prevItems.map(item => ({
                    ...item,
                    people: [],
                    users: 1,
                }))
            );
            setStep(2);
            return;
        }

        setStep(1);
    };

    const reset = () => {
        setInputType(null);
        setPhotoUri(null);
        setReceiptID(null);
        setReceiptItems([]);
        setReceiptTotal(0);
    };

    const onRetake = () => {
        reset();
        setStep(0);
    };

    const onAccept = () => {
        setStep(2);
    };

    const handleSelectPeople = async (selectedItems, isUpdate = false) => {
        setIsLoading(true);

        if (!isUpdate) {
            setReceiptItems(prevItems =>
                prevItems.map(item => ({
                    ...item,
                    people: [],
                    users: 1,
                }))
            );
        } else {
            const newUserIds = new Set(selectedItems.uniqueMemberIds.map(member => member.id));
            setReceiptItems(prevItems =>
                prevItems.map(item => {
                    const updatedPeople = (item.people || []).filter(person =>
                        newUserIds.has(person.id)
                    );

                    return {
                        ...item,
                        people: updatedPeople,
                        users: updatedPeople.length || 1,
                    };
                })
            );
        }

        setSelectedPeople(selectedItems);

        if (!isUpdate) {
            if (inputType === "manual") {
                setStep(3);
                setIsLoading(false);
                return true;
            }

            setStep(3);

            const MAX_ATTEMPTS = 15;
            const INTERVAL = 1000;
            let pollingAttempts = 0;
            let pollingTimeout;

            const pollReceipt = async () => {
                if (pollingAttempts >= MAX_ATTEMPTS) {
                    setIsLoading(false);
                    alert(
                        "Receipt processing is taking longer than expected. Please try again later."
                    );
                    return;
                }

                try {
                    if (!receiptID) {
                        pollingAttempts++;
                        pollingTimeout = setTimeout(pollReceipt, INTERVAL);
                        return;
                    }

                    console.log(`fetching receipt: ${receiptID}`);
                    const data = await receiptService.fetchReceipt(receiptID);

                    if (data && data.status === "completed") {
                        console.log(`data: ${JSON.stringify(data, null, 2)}`);
                        const receiptData = data.processed_data;
                        console.log(JSON.stringify(receiptData, null, 2));
                        setReceiptItems(receiptData.items);
                        const total = receiptData.items.reduce((sum, item) => {
                            const price =
                                typeof item.price === "string"
                                    ? parseFloat(item.price)
                                    : item.price;
                            return sum + (isNaN(price) ? 0 : price);
                        }, 0);
                        setReceiptTotal(total);
                        setIsLoading(false);
                        return;
                    }

                    pollingAttempts++;
                    pollingTimeout = setTimeout(pollReceipt, INTERVAL);
                } catch (error) {
                    console.error(`Polling error (attempt ${pollingAttempts + 1}):`, error);
                    if (pollingAttempts === MAX_ATTEMPTS - 1) {
                        alert("Receipt processing failed. Please try again.");
                        setIsLoading(false);
                        return;
                    }
                    pollingAttempts++;
                    pollingTimeout = setTimeout(pollReceipt, INTERVAL);
                }
            };

            pollReceipt();

            return () => {
                if (pollingTimeout) {
                    clearTimeout(pollingTimeout);
                }
            };
        } else {
            setIsLoading(false);
        }
    };

    const handleReceiptUpdate = (items, total) => {
        setReceiptItems(items);
        setReceiptTotal(total);
    };

    const handleSplitBill = result => {
        setProcessed(result);
        setStep(4);
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return <CameraScreen navigation={navigation} onPictureTaken={handlePictureTaken} />;
            case 1:
                return <PhotoReview photoUri={photoUri} onRetake={onRetake} onAccept={onAccept} />;
            case 2:
                return (
                    <ContactList
                        setStep={setStep}
                        onSelectPeople={items => handleSelectPeople(items, false)}
                        type="Next"
                        handleBack={handleBack}
                        fetchedFriends={friends}
                        fetchedGroups={groups}
                        groupData={
                            Array.isArray(selectedPeople)
                                ? { uniqueMemberIds: [], friends: selectedPeople, groups: [] }
                                : selectedPeople
                        }
                    />
                );
            case 3:
                return (
                    <ReceiptView
                        navigation={navigation}
                        setStep={handleBack}
                        onProcessed={handleSplitBill}
                        selectedPeople={selectedPeople}
                        photoUri={photoUri}
                        ocrData={{
                            items: receiptItems,
                            subtotal: receiptTotal,
                        }}
                        setPeopleHashMap={setPeopleHashMap}
                        onUpdatePeople={items => handleSelectPeople(items, true)}
                        onUpdateReceipt={handleReceiptUpdate}
                        initialTotal={receiptTotal}
                    />
                );
            case 4:
                return (
                    <ReviewWrapper
                        setStep={newStep => {
                            if (newStep === 3) {
                                setStep(3);
                            } else if (newStep === 0) {
                                reset();
                                setStep(0);
                            }
                        }}
                        processed={processed}
                        receiptID={receiptID}
                        peopleHashMap={peopleHashMap}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <LoadingWrapper isLoading={isLoading}>{renderStep()}</LoadingWrapper>
        </View>
    );
};

export default UploadScreen;
