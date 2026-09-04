import paramiko

HOST = '39.104.20.182'
USER = 'root'
PASSWORD = 'LN:-LHLAdXnHh9M'
REMOTE_DIR = '/opt/elephant-platform'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30, allow_agent=False, look_for_keys=False)

    print('=== 搜索传 showCountyBoundaries 的文件 ===')
    cmd = f'grep -rn "showCountyBoundaries" {REMOTE_DIR}/src --include="*.tsx" 2>/dev/null'
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    print(out if out.strip() else '未找到')

    ssh.close()

if __name__ == '__main__':
    main()
