import FormData from "form-data";

class ReceiptService {
    constructor() {
        this.apiUrl = "http://47.144.148.193:8000/api/v1";
    }

    async upload(photoUri, user_id) {
        try {
            const response = await fetch(photoUri);
            const blob = await response.blob();

            const formData = new FormData();
            formData.append("user_id", user_id);
            const fileExtension = photoUri.split(".").pop() || "jpg";

            formData.append("image", {
                uri: photoUri,
                type: "image/*",
                name: `receipt.${fileExtension}`,
            });

            const uploadResponse = await fetch(`${this.apiUrl}/receipts/`, {
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                body: formData,
            });

            const data = await uploadResponse.json();
            return data;
        } catch (error) {
            console.error("Upload error:", error);
            throw error;
        }
    }

    async fetchReceipt(receipt_id) {
        const response = await fetch(`${this.apiUrl}/receipts/${receipt_id}`);
        const data = await response.json();

        if (data.status === "pending") return;

        return data;
    }
}

export default ReceiptService;
