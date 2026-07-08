from app.utils.security import hash_password

password = "12345678"

hashed = hash_password(password)

print("Original :", password)
print("Hashed   :", hashed)