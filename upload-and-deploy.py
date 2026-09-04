# -*- coding: utf-8 -*-
"""
上传并部署脚本：打包上传 -> 解压 -> 构建 -> 重启 -> 验证
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

import tarfile
import tempfile

UPLOAD_ITEMS = ["src", "package.json", "package-lock.json", "next.config.js", "tsconfig.json", "tailwind.config.js", "postcss.config.js", "public"]

def main():
    proj = os.path.dirname(os.path.abspath(__file__))
    ssh = connect()
    sftp = ssh.open_sftp()

    print("=== 打包文件 ===")
    tar_path = os.path.join(tempfile.gettempdir(), "deploy.tar.gz")
    with tarfile.open(tar_path, "w:gz") as tar:
        for item in UPLOAD_ITEMS:
            local = os.path.join(proj, item)
            if os.path.exists(local):
                tar.add(local, arcname=item)
                print(f"  打包: {item}")

    print("\n=== 上传到 ECS ===")
    remote_tar = "/tmp/deploy.tar.gz"
    sftp.put(tar_path, remote_tar)
    print("  上传完成")

    print("\n=== 解压 ===")
    print(run(ssh, f"cd {REMOTE} && tar xzf {remote_tar}")[1])

    print("\n=== 安装依赖 ===")
    print(run(ssh, f"cd {REMOTE} && npm install 2>&1 | tail -5", timeout=300)[1])

    print("\n=== 构建 ===")
    code, out, err = run(ssh, f"cd {REMOTE} && npm run build 2>&1 | tail -20", timeout=300)
    print(out)
    if code != 0:
        print("BUILD FAILED:", err)
        sys.exit(1)

    print("\n=== 重启 PM2 ===")
    print(run(ssh, "pm2 restart elephant-platform")[1])

    print("\n=== 验证 ===")
    print(run(ssh, "sleep 3 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000")[1])

    sftp.close()
    ssh.close()
    print("\n部署完成")

if __name__ == "__main__":
    main()
