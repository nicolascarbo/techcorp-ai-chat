# Triton Inference Server Configuration

This directory contains the Triton Inference Server model repository configuration for hosting the **Phi-3.5-Financial** model using the `vllm` backend.

## Structure
```
tritton_server/
├── model_repository/
│   └── phi-3.5-financial/
│       ├── 1/
│       │   └── model.json     # vLLM Engine configurations
│       └── config.pbtxt       # Triton model repository configuration
└── README.md                  # This file
```

---

## 1. Prerequisites

To run this Triton Inference Server setup, you need:
1. **Docker** installed.
2. **NVIDIA Container Toolkit** configured (if using GPU acceleration).
3. Access to a GPU with sufficient VRAM (at least 8–10 GB is recommended for local inference of Phi-3.5).

---

## 2. Deploying with Docker

You can spin up Triton Inference Server with the vLLM backend using the official NVIDIA Triton Docker image. Run the following command from the root of this project:

```bash
docker run --gpus all -it --rm \
  -p 8000:8000 -p 8001:8001 -p 8002:8002 \
  -v $(pwd)/tritton_server/model_repository:/models \
  -e HF_TOKEN="your_huggingface_write_token_if_needed" \
  nvcr.io/nvidia/tritonserver:24.05-vllm-python-py3 \
  tritonserver --model-repository=/models
```

### Explanations of Arguments:
- `--gpus all`: Enables GPU acceleration inside the Docker container.
- `-p 8000:8000`: Exposes the HTTP REST API.
- `-p 8001:8001`: Exposes the gRPC API.
- `-p 8002:8002`: Exposes the Triton metrics endpoint.
- `-v ...:/models`: Mounts our local model repository folder inside the container's `/models` path.
- `nvcr.io/nvidia/tritonserver:24.05-vllm-python-py3`: Image with Triton and vLLM backend pre-installed.

---

## 3. Querying the Model

Once Triton starts up, it will serve the model. You can verify that it is active by calling the health endpoint:

```bash
curl -i http://localhost:8000/v2/health/ready
```

### API Endpoint (v2)
To generate text using the standard Triton v2 API:

**Endpoint**: `POST http://localhost:8000/v2/models/phi-3.5-financial/generate`

**Payload**:
```json
{
  "text_input": "Explain the difference between equity and debt from a corporate finance standpoint.",
  "parameters": {
    "max_tokens": 128,
    "temperature": 0.2
  }
}
```

For OpenAI-compatible Chat Completions, you can use the standard vLLM integration endpoints exposed by Triton if configured.
