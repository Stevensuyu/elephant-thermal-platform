import paramiko
import os
from stat import S_ISDIR

ECS_HOST = "39.104.20.182"
ECS_USER = "root"
ECS_PASS = "LN:-LHLAdXnHh9M"
REMOTE_BASE = "/opt/elephant-platform/public"
LOCAL_BASE = r"C:\Users\123\Desktop\elephant-thermal-risk-platform\public"

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {ECS_HOST}...")
    ssh.connect(ECS_HOST, username=ECS_USER, password=ECS_PASS, timeout=30)
    print("Connected!")

    sftp = ssh.open_sftp()

    # List remote public directory
    print(f"\n=== Remote {REMOTE_BASE} ===")
    try:
        items = sftp.listdir_attr(REMOTE_BASE)
        for item in items:
            print(f"  {item.filename} ({item.st_size} bytes)")
    except Exception as e:
        print(f"Error listing: {e}")

    # Download function
    def download_dir(remote_dir, local_dir):
        os.makedirs(local_dir, exist_ok=True)
        for item in sftp.listdir_attr(remote_dir):
            remote_path = f"{remote_dir}/{item.filename}"
            local_path = os.path.join(local_dir, item.filename)
            if S_ISDIR(item.st_mode):
                print(f"  Dir: {item.filename}/")
                download_dir(remote_path, local_path)
            else:
                print(f"  Downloading: {item.filename} ({item.st_size} bytes)")
                sftp.get(remote_path, local_path)

    # Download police-bg.jpg
    remote_bg = f"{REMOTE_BASE}/police-bg.jpg"
    local_bg = os.path.join(LOCAL_BASE, "police-bg.jpg")
    try:
        sftp.stat(remote_bg)
        print(f"\nDownloading police-bg.jpg...")
        sftp.get(remote_bg, local_bg)
        print(f"  Saved to {local_bg} ({os.path.getsize(local_bg)} bytes)")
    except Exception as e:
        print(f"  police-bg.jpg not found: {e}")

    # Download map/ directory
    remote_map = f"{REMOTE_BASE}/map"
    local_map = os.path.join(LOCAL_BASE, "map")
    try:
        sftp.stat(remote_map)
        print(f"\nDownloading map/ directory...")
        download_dir(remote_map, local_map)
    except Exception as e:
        print(f"  map/ not found: {e}")

    # Verify
    print(f"\n=== Local public after restore ===")
    for root, dirs, files in os.walk(LOCAL_BASE):
        for f in files:
            fp = os.path.join(root, f)
            print(f"  {os.path.relpath(fp, LOCAL_BASE)} ({os.path.getsize(fp)} bytes)")

    sftp.close()
    ssh.close()
    print("\nDone!")

if __name__ == "__main__":
    main()
