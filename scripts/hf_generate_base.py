import argparse
import os

from huggingface_hub import InferenceClient


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', default='Tongyi-MAI/Z-Image')
    ap.add_argument('--prompt', required=True)
    ap.add_argument('--output', required=True)
    ap.add_argument('--width', type=int, default=768)
    ap.add_argument('--height', type=int, default=1024)
    args = ap.parse_args()

    token = os.environ.get('HF_TOKEN')
    if not token:
        raise SystemExit('Missing HF_TOKEN env var')

    client = InferenceClient(model=args.model, token=token)
    img = client.text_to_image(args.prompt, width=args.width, height=args.height)
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    img.save(args.output)
    print(args.output)


if __name__ == '__main__':
    main()
