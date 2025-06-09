// backend/routes/auth.js
import { auth, db } from '../../firebase.js';

export default [
  {
    method: 'POST',
    path: '/api/signup',
    handler: async (request, h) => {
      const { firstName, lastName, email, password } = request.payload;

      if (!firstName || !lastName || !email || !password) {
        return h.response({ error: 'Semua field harus diisi' }).code(400);
      }

      try {
        const userRecord = await auth.createUser({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
        });

        console.log('User created:', userRecord.uid);

        await db.collection('user-information').doc(userRecord.uid).set({
          firstName,
          lastName,
          email,
          createdAt: new Date(),
        });

        return h.response({
          message: 'User created successfully',
          user: {
            uid: userRecord.uid,
            email: userRecord.email,
          }
        }).code(201);

      } catch (error) {
        console.error('Error creating user:', error);
        return h.response({ error: 'Gagal membuat akun. Silakan coba lagi.' }).code(500);
      }
    }
  }
];
