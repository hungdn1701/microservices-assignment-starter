# SSL Certificates for API Gateway

This directory is used to store SSL certificates for HTTPS support in the API Gateway.

## Development Certificates

For development, you can generate self-signed certificates using OpenSSL:

```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate certificate signing request
openssl req -new -key private.key -out certificate.csr

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in certificate.csr -signkey private.key -out certificate.crt
```

## Production Certificates

For production, you should use certificates from a trusted Certificate Authority (CA) like Let's Encrypt.

## Configuration

Place your certificates in this directory with the following names:
- `private.key`: Your private key
- `certificate.crt`: Your certificate

Or specify custom paths in your environment variables:
- `SSL_KEY_PATH`: Path to your private key
- `SSL_CERT_PATH`: Path to your certificate

## Enabling HTTPS

To enable HTTPS, set the following environment variables:
- `HTTPS_ENABLED=true`
- `HTTPS_PORT=4443` (or your preferred HTTPS port)
