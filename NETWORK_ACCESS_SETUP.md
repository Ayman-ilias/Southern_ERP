# Network Access Setup Guide

## Problem
The application is accessible on your local WiFi but not from other networks.

## Solution
The application needs to bind to `0.0.0.0` instead of `localhost` to accept connections from any network interface.

## Changes Made

1. **Updated `package.json`**: Modified the dev script to bind to `0.0.0.0`
2. **Updated Docker Compose**: Added explicit port binding and HOSTNAME environment variable
3. **Backend**: Already configured correctly with `--host 0.0.0.0`

## Additional Steps Required

### 1. Windows Firewall Configuration

You need to allow incoming connections on ports 2222 and 8000:

**Option A: Using Windows Firewall GUI**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port `2222` → Next
6. Select "Allow the connection" → Next
7. Check all profiles (Domain, Private, Public) → Next
8. Name it "ERP Frontend" → Finish
9. Repeat for port `8000` (name it "ERP Backend")

**Option B: Using PowerShell (Run as Administrator)**
```powershell
# Allow port 2222 (Frontend)
New-NetFirewallRule -DisplayName "ERP Frontend" -Direction Inbound -LocalPort 2222 -Protocol TCP -Action Allow

# Allow port 8000 (Backend)
New-NetFirewallRule -DisplayName "ERP Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### 2. Router Configuration (If accessing from outside local network)

If you want to access from completely different networks (not just different WiFi), you'll need:

1. **Port Forwarding** on your router:
   - Forward external port 2222 → internal IP 192.168.0.199:2222
   - Forward external port 8000 → internal IP 192.168.0.199:8000

2. **Static IP**: Ensure your computer has a static IP (192.168.0.199) or use DHCP reservation

### 3. Restart Services

After making changes, restart your Docker containers:

```bash
docker-compose down
docker-compose up -d
```

### 4. Verify Access

- **From same network**: `http://192.168.0.199:2222`
- **From different network**: `http://<your-public-ip>:2222` (requires port forwarding)

## Testing

1. **Test from same network**: Use another device on the same WiFi
2. **Test from different network**: Use a mobile hotspot or different WiFi
3. **Check if accessible**: Try accessing `http://192.168.0.199:2222` from another device

## Troubleshooting

### Still can't access?

1. **Check if services are running**:
   ```bash
   docker ps
   ```

2. **Check if ports are listening**:
   ```bash
   netstat -an | findstr "2222"
   netstat -an | findstr "8000"
   ```

3. **Check Windows Firewall**:
   ```powershell
   Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*ERP*"}
   ```

4. **Check Docker port binding**:
   ```bash
   docker port rmg_erp_frontend
   docker port rmg_erp_backend
   ```

5. **Verify IP address**:
   ```bash
   ipconfig
   ```
   Make sure your IP is actually `192.168.0.199`

## Security Note

⚠️ **Warning**: Making the application accessible from any network exposes it to potential security risks. Consider:
- Using HTTPS in production
- Implementing proper authentication
- Using a VPN for remote access
- Restricting access to specific IP addresses if possible

