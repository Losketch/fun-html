import msgpack
import zlib
import argparse
from pathlib import Path
import json

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="一个使用 msgpack+zlib 压缩 JSON 的工具。")
    parser.add_argument('input', type=str, help='要压缩的文件。', nargs="+")
    args = parser.parse_args()

    for path in args.input:
        output_path = Path(path).with_suffix(".mp.zlib")
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        with open(output_path, "wb") as f:
            packed = msgpack.packb(data)
            if packed:
                f.write(zlib.compress(packed, level=9))
