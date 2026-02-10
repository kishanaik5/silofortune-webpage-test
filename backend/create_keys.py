from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

def generate_keys():
    key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    
    private_key = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    public_key = key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    with open("private_key.pem", "wb") as f:
        f.write(private_key)
        
    with open("public_key.pem", "wb") as f:
        f.write(public_key)
    
    print("RSA Keys generated successfully!")

if __name__ == "__main__":
    generate_keys()
