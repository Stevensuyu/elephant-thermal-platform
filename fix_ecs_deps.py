# -*- coding: utf-8 -*-
"""
修复ECS依赖问题：清理node_modules -> 重新npm install -> 构建 -> 重启
"""
import paramiko
import time

HOST = "39.104.20.182"
USER = "root"
PASSWORD = "LN:-LHLAdXnHh9M"
REMOTE = "/opt/elephant-platform"

def run(ssh, cmd, timeout=300):
    _, so, se = ssh.exec_command(cmd, timeout=timeout)
    out = so.read().decode("utf-8", "replace")
    err = se.read().decode("utf-8", "replace")
    code = so.channel.recv_exit_status()
    return code, out, err

def main():
    print("=== 连接SSH ===")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print("  已连接")

    print("\n=== 1. 停止PM2 ===")
    run(ssh, "pm2 stop elephant-platform", timeout=30)
    print("  已停止")

    print("\n=== 2. 清理node_modules和.next ===")
    code, out, err = run(ssh, f"cd {REMOTE} && rm -rf node_modules .next && echo 'CLEANED'", timeout=120)
    print(f"  退出码: {code}, {out.strip()}")

    print("\n=== 3. 清理npm缓存 ===")
    run(ssh, "npm cache clean --force 2>/dev/null; echo 'CACHE CLEARED'", timeout=60)
    print("  缓存已清理")

    print("\n=== 4. 重新安装依赖 (npm install) ===")
    code, out, err = run(ssh, f"cd {REMOTE} && npm install --registry=https://registry.npmmirror.com 2>&1 | tail -10", timeout=300)
    print(f"  退出码: {code}")
    print(f"  {out[-500:]}")
    if code != 0:
        print(f"  错误: {err[-500:]}")

    print("\n=== 5. 验证caniuse-lite ===")
    code, out, err = run(ssh, f"ls {REMOTE}/node_modules/caniuse-lite/dist/unpacker/index.js 2>&1", timeout=15)
    print(f"  caniuse-lite: {out.strip()}")

    print("\n=== 6. 构建 (npm run build) ===")
    code, out, err = run(ssh, f"cd {REMOTE} && npm run build 2>&1 | tail -25", timeout=600)
    print(f"  退出码: {code}")
    for line in out.strip().split("\n")[-15:]:
        print(f"  {line}")
    if code != 0:
        print(f"  构建失败! 错误: {err[-1000:]}")
        ssh.close()
        return

    print("\n=== 7. PM2启动 ===")
    run(ssh, "pm2 start elephant-platform", timeout=30)
    time.sleep(10)
    code, out, _ = run(ssh, "pm2 status elephant-platform", timeout=15)
    print(out)

    print("\n=== 8. 健康检查 ===")
    time.sleep(5)
    code, out, _ = run(ssh, 'curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', timeout=15)
    print(f"  HTTP状态码: {out.strip()}")

    ssh.close()
    print("\n=== 修复完成 ===")

if __name__ == "__main__":
    main()
