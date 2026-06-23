import sys
import json
import time
import random

# 读取 Electron 传递的输入参数
def main():
    input_params = sys.stdin.read()
    data = json.loads(input_params)
    filePath = data['filePath']
    # 模拟处理逻辑
    time.sleep(5)
    score = generateScore()
    result = {"score": score/63, "result": True, "level": "轻微" if score < 14 else "轻度"}

    print(json.dumps(result))
    sys.stdout.flush()


# 生成模拟值
def generateScore():
    r = random.uniform(0, 1)  # 生成一个 0 到 1 的浮点数
    if r <= 0.9:  # 90% 概率生成 0-13
        return random.randint(0, 13)
    else:  # 10% 概率生成 14-19
        return random.randint(14, 19)


if __name__ == "__main__":
    main()
