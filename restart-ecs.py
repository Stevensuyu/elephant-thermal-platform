import paramiko, time
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("39.104.20.182", username="root", password="LN:-LHLAdXnHh9M", timeout=30)
# Wait for build to finish
for i in range(6):
    stdin, stdout, stderr = ssh.exec_command("pgrep -f 'next build' || echo DONE")
    result = stdout.read().decode().strip()
    print(f"Check {i+1}: {result[:50]}")
    if "DONE" in result:
        break
    time.sleep(10)
# Restart PM2
print("=== Restarting PM2 ===")
stdin, stdout, stderr = ssh.exec_command("pm2 restart elephant-platform && sleep 3 && pm2 list")
print(stdout.read().decode())
# Verify HTTP
time.sleep(3)
stdin, stdout, stderr = ssh.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000")
print(f"=== HTTP: {stdout.read().decode()} ===")
ssh.close()
print("DONE")
