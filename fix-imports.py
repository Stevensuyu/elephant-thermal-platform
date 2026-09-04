# -*- coding: utf-8 -*-
"""
导入修复脚本：检查并修复项目中缺失或错误的 import 语句
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

import re

def main():
    """检查 src 目录下所有 .ts/.tsx 文件的 import 语句"""
    import os
    src_dir = os.path.join(os.path.dirname(__file__), "src")
    issues = []
    for root, dirs, files in os.walk(src_dir):
        for f in files:
            if f.endswith((".ts", ".tsx")):
                fpath = os.path.join(root, f)
                with open(fpath, "r", encoding="utf-8") as fh:
                    for i, line in enumerate(fh, 1):
                        if "from '@/" in line:
                            mod = line.split("from '@/")[1].split("'")[0]
                            candidates = [
                                os.path.join(src_dir, mod + ".ts"),
                                os.path.join(src_dir, mod + ".tsx"),
                                os.path.join(src_dir, mod, "index.ts"),
                                os.path.join(src_dir, mod, "index.tsx"),
                            ]
                            if not any(os.path.exists(c) for c in candidates):
                                issues.append(f"{fpath}:{i} -> {mod}")
    if issues:
        print("=== 缺失的 import ===")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("所有 import 均有效")

if __name__ == "__main__":
    main()
