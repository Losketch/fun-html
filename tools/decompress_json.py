import msgpack
import zlib
import argparse
from pathlib import Path
import json

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="一个使用 msgpack+zlib 解压缩 JSON 的工具。")
    parser.add_argument('input', type=str, help='要解压缩的文件。', nargs="+")
    args = parser.parse_args()

    for path in args.input:
        output_path = Path(path).with_suffix(".json")
        with open(path, "rb") as f:
            compressed_data = f.read()
            if compressed_data:
                data = msgpack.unpackb(zlib.decompress(compressed_data))
                with open(output_path, "w") as out_f:
                    json.dump(data, out_f, ensure_ascii=False, indent=2)
