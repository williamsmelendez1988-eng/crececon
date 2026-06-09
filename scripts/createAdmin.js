// INSTRUCCIONES:
// 1. Ve a tu consola de Firebase: https://console.firebase.google.com
// 2. Selecciona proyecto crececon-269ff
// 3. Ve a Authentication -> Users -> Add User
// 4. Email: williamsmelendez1988@gmail.com
// 5. Password: la que quieras (mínimo 6 caracteres)
// 6. Copia el UID que te genera
// 7. Ve a Firestore -> Agrega documento en colección "usuarios" con ese UID como ID
// 8. Agrega los campos:
//    uid: (el UID copiado)
//    nombre: "Williams Meléndez"
//    email: "williamsmelendez1988@gmail.com"
//    rol: "admin"
//    activo: true
//    createdAt: (timestamp actual)

// O usa este script con Node.js si tienes las credenciales de servicio:
// node scripts/createAdmin.js

console.log(`
========================================
SETUP INICIAL DE CRECECON
========================================

Pasos para crear el admin:

1. Abre: https://console.firebase.google.com/project/crececon-269ff/authentication/users
2. Clic en "Add user"
3. Email: williamsmelendez1988@gmail.com
4. Password: CreceCon2024! (o la que prefieras)
5. Clic en "Add user" y copia el UID

6. Ve a Firestore:
   https://console.firebase.google.com/project/crececon-269ff/firestore

7. Clic en "Start collection" → ID: "usuarios"
8. Document ID: pega el UID del paso 5
9. Agrega estos campos:
   - uid (string): [el UID]
   - nombre (string): Williams Meléndez
   - email (string): williamsmelendez1988@gmail.com
   - rol (string): admin
   - activo (boolean): true

10. Guarda y ya puedes iniciar sesión en /login
========================================
`);
