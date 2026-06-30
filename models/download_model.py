import os
import sys

def check_dependencies():
    try:
        import huggingface_hub
    except ImportError:
        print("Required library 'huggingface_hub' is not installed.")
        print("Please install it by running: pip install huggingface_hub")
        sys.exit(1)

def download_model(repo_id="Josephgflowers/Phinance-Phi-3.5-mini-instruct-finance-v0.3"):
    from huggingface_hub import snapshot_download
    
    # Target directory relative to this script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    local_dir = os.path.join(base_dir, "phi-3.5-financial")
    
    print(f"Starting download of model: '{repo_id}'")
    print(f"Target local directory: '{local_dir}'")
    print("This might take a while depending on your internet connection...")
    
    try:
        snapshot_download(
            repo_id=repo_id,
            local_dir=local_dir,
            local_dir_use_symlinks=False,
            ignore_patterns=["*.gguf", "*.bin"]  # Ignore alternative formats to save bandwidth
        )
        print("\nDownload completed successfully!")
        print(f"Model files are located in: {local_dir}")
    except Exception as e:
        print(f"\nAn error occurred during download: {e}")
        print("Make sure you have an active internet connection and that the HuggingFace repository ID is correct.")

if __name__ == "__main__":
    check_dependencies()
    
    repo = "Josephgflowers/Phinance-Phi-3.5-mini-instruct-finance-v0.3"
    if len(sys.argv) > 1:
        repo = sys.argv[1]
        
    download_model(repo)
