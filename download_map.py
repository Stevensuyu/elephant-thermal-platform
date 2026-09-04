import paramiko

HOST = '39.104.20.182'
USER = 'root'
PASSWORD = 'LN:-LHLAdXnHh9M'
REMOTE_DIR = '/opt/elephant-platform'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30, allow_agent=False, look_for_keys=False)

    # 从ECS下载RealMap组件
    sftp = ssh.open_sftp()
    remote_path = f'{REMOTE_DIR}/src/components/dashboard/dashboard-real-map-leaflet.tsx'
    local_path = 'src/components/dashboard/dashboard-real-map-leaflet-ecs.tsx'
    sftp.get(remote_path, local_path)
    sftp.close()
    print('已从ECS下载RealMap组件')

    ssh.close()

if __name__ == '__main__':
    main()
