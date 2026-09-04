# -*- coding: utf-8 -*-
"""
部署测试脚本：验证部署后 HTTP 状态、页面标题、API 响应
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

import time

def main():
    ssh = connect()
    print("=== HTTP 状态检查 ===")
    for path in ["/", "/api/auth/login", "/api/tasks"]:
        code, out, _ = run(ssh, f"curl -s -o /dev/null -w '%{http_code}' http://localhost:3000{path}")
        print(f"  {path}: {out}")
    print("\n=== 页面标题检查 ===")
    print(run(ssh, "curl -s http://localhost:3000/ | grep -o '<title>[^<]*</title>'")[1])
    print("\n=== PM2 状态 ===")
    print(run(ssh, "pm2 list")[1])
    ssh.close()

if __name__ == "__main__":
    main()
