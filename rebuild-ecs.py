# -*- coding: utf-8 -*-
"""
ECS 重建脚本：在 ECS 上重新安装依赖并构建，不上传新文件
"""
import paramiko
import sys

HOST = "39.104.20.182"
USER = "root"
PASSWORD = "LN:-LHLAdXnHh9M"
REMOTE = "/opt/elephant-platform"

def run(ssh, cmd, timeout=120):
    _, so, se = ssh.exec_command(cmd, timeout=timeout)
    out = so.read().decode("utf-8", "replace")
    err = se.read().decode("utf-8", "replace")
    code = so.channel.recv_exit_status()
    return code, out, err

def connect():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    return ssh

def main():
    ssh = connect()
    print("=== 重新安装依赖 ===")
    print(run(ssh, f"cd {REMOTE} && npm install 2>&1 | tail -10", timeout=300)[1])
    print("\n=== 重新构建 ===")
    code, out, err = run(ssh, f"cd {REMOTE} && npm run build 2>&1 | tail -30", timeout=300)
    print(out)
    if code != 0:
        print("BUILD FAILED:", err)
        sys.exit(1)
    print("\n=== 重启 PM2 ===")
    print(run(ssh, "pm2 restart elephant-platform")[1])
    print("\n=== 验证 ===")
    print(run(ssh, "sleep 3 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000")[1])
    ssh.close()

if __name__ == "__main__":
    main()
