import argparse
import os

from huggingface_hub import InferenceClient
from PIL import Image


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', default='black-forest-labs/FLUX.2-klein-4B')
    ap.add_argument('--prompt', required=True)
    ap.add_argument('--input', required=True)
    ap.add_argument('--output', required=True)
    ap.add_argument('--strength', type=float, default=0.65)
    args = ap.parse_args()

    token = os.environ.get('HF_TOKEN')
    if not token:
        raise SystemExit('Missing HF_TOKEN env var')

    client = InferenceClient(model=args.model, token=token)

    image = Image.open(args.input).convert('RGB')
    out = client.image_to_image(image=image, prompt=args.prompt, strength=args.strength)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    out.save(args.output)
    print(args.output)


if __name__ == '__main__':
    main()
