# Models Folder - Phi-3.5-Financial

This directory is designated for holding local weights of the **Phi-3.5-Financial** model.

## Model Metadata

*   **Model Name**: Phi-3.5-Financial
*   **Base Architecture**: `microsoft/Phi-3.5-mini-instruct` (3.82 Billion parameters, 128k context length)
*   **Default Fine-Tuned Version**: [`Josephgflowers/Phinance-Phi-3.5-mini-instruct-finance-v0.3`](https://huggingface.co/Josephgflowers/Phinance-Phi-3.5-mini-instruct-finance-v0.3)
*   **Domain Focus**: Financial Question Answering, Sentiment Analysis, RAG, Financial Text Extraction.

---

## 1. Downloading the Model Weights

A helper script is provided to download the model snapshot from HuggingFace to this local directory:

1.  **Install dependencies**:
    ```bash
    pip install huggingface_hub
    ```

2.  **Run the script**:
    ```bash
    python models/download_model.py
    ```

    *Optional: You can specify a different Hugging Face repository ID as an argument:*
    ```bash
    python models/download_model.py "user/other-phi3.5-finance-fine-tune"
    ```

Once completed, the model weights will be downloaded to `models/phi-3.5-financial/`.

---

## 2. Quantization Options

If you are running on low-resource environments (e.g. standard CPU or low VRAM GPU), you might want to look into GGUF quantization formats:
- Quantized version: [`mradermacher/Phinance-Phi-3.5-mini-instruct-finance-v0.3-GGUF`](https://huggingface.co/mradermacher/Phinance-Phi-3.5-mini-instruct-finance-v0.3-GGUF)
- Supported quantization: `Q4_K_M` (recommended for optimal speed/size trade-off).
