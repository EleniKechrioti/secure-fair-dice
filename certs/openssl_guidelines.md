## Transport Layer Security (TLS) Implementation

The following steps outline the process followed to establish a secure HTTPS connection via TLS encryption between the client and the Django server.

---

### 1. Local Certificate Authority (CA)

To simulate a real Public Key Infrastructure (PKI), we created a local Certificate Authority (CA) using OpenSSL.
The CA is responsible for issuing and signing the server certificate used by the HTTPS server.

Example command used:
```bash
openssl genrsa -out certs/ca.key 2048
```

This command generates the private key of the Certificate Authority. The key is used exclusively for signing certificates and must normally remain secret.

Next, we generated the CA certificate:
```bash
openssl req -new -x509 -key certs/ca.key -out certs/ca.crt -days 365
```

This creates a self-signed certificate representing the Certificate Authority. Clients can use this certificate to verify the authenticity of certificates signed by this CA.

---

### 2. Server Key Generation

The Django server requires its own private key for TLS communication.
```bash
openssl genrsa -out certs/server.key 2048
```

This command generates the server's RSA private key, which is used during the TLS handshake to prove the server's identity and establish encrypted communication.

---

### 3. Certificate Signing Request (CSR)

The server then generates a Certificate Signing Request (CSR) which contains the server's public key and identifying information.
```bash
openssl req -new -key certs/server.key -out certs/server.csr
```

The CSR is submitted to the Certificate Authority so that the CA can issue a valid certificate for the server.

---

### 4. Signing the Server Certificate

The Certificate Authority signs the server CSR and produces the final TLS certificate used by the Django server.
```bash
openssl x509 -req -in certs/server.csr \
  -CA certs/ca.crt \
  -CAkey certs/ca.key \
  -CAcreateserial \
  -out certs/server.crt \
  -days 365
```

This operation ensures that the server certificate is cryptographically linked to the CA, allowing clients to verify its authenticity.

---

### 5. HTTPS Django Server

To enable HTTPS locally, we used the django-extensions `runserver_plus` command, which supports SSL certificates.

The server is started with:
```bash
python manage.py runserver_plus 127.0.0.1:8000 \
  --cert-file certs/server.crt \
  --key-file certs/server.key
```

This instructs Django to start a development server using the provided TLS certificate and private key.

---

### 6. Secure Cookies

To ensure session data is transmitted only over encrypted channels, the following Django security settings were enabled:
```python
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

These settings guarantee that authentication and CSRF cookies are only transmitted over HTTPS connections, preventing leakage over insecure channels.