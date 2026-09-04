# -*- coding: utf-8 -*-
"""
修复ECS maath包问题：重装maath -> 构建 -> 重启
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

    print("\n=== 2. 检查maath当前状态 ===")
    code, out, err = run(ssh, f"ls -la {REMOTE}/node_modules/maath/dist/ 2>&1 | head -20", timeout=15)
    print(out)

    print("\n=== 3. 重装maath ===")
    code, out, err = run(ssh, f"cd {REMOTE} && npm uninstall maath 2>&1 | tail -3 && npm install maath@0.10.8 --registry=https://registry.npmmirror.com 2>&1 | tail -5", timeout=120)
    print(f"  退出码: {code}")
    print(f"  {out[-500:]}")

    print("\n=== 4. 验证maath文件 ===")
    code, out, err = run(ssh, f"ls {REMOTE}/node_modules/maath/dist/isNativeReflectConstruct*.esm.js 2>&1", timeout=15)
    print(f"  {out.strip()}")

    print("\n=== 5. 构建 ===")
    code, out, err = run(ssh, f"cd {REMOTE} && npm run build 2>&1 | tail -25", timeout=600)
    print(f"  退出码: {code}")
    for line in out.strip().split("\n")[-15:]:
        print(f"  {line}")
    if code != 0:
        print(f"  构建失败! 错误: {err[-1500:]}")
        ssh.close()
        return

    print("\n=== 6. PM2启动 ===")
    run(ssh, "pm2 start elephant-platform", timeout=30)
    time.sleep(12)
    code, out, _ = run(ssh, "pm2 status elephant-platform", timeout=15)
    print(out)

    print("\n=== 7. 健康检查 ===")
    time.sleep(5)
    code, out, _ = run(ssh, 'curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', timeout=15)
    print(f"  HTTP状态码: {out.strip()}")

    ssh.close()
    print("\n=== 完成 ===")

if __name__ == "__main__":
    main()
