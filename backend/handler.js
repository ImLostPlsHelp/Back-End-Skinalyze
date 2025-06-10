// backend/routes/auth.js
import { auth, db, getAuth, signInWithEmailAndPassword } from "../firebase.js";

export const SignUpHandler = async (request, h) => {
  const { firstName, lastName, email, password } = request.payload;

  if (!firstName || !lastName || !email || !password) {
    return h.response({ error: "Semua field harus diisi" }).code(400);
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
    });

    console.log("User created:", userRecord.uid);

    await db.collection("user-information").doc(userRecord.uid).set({
      firstName,
      lastName,
      email,
      createdAt: new Date(),
    });

    return h
      .response({
        message: "User created successfully",
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
        },
      })
      .code(201);
  } catch (error) {
    console.error("Error creating user:", error);
    return h
      .response({ error: "Gagal membuat akun. Silakan coba lagi." })
      .code(500);
  }
};

export const LoginHandler = async (request, h) => {
  const { email, password } = request.payload;
  if (!email || !password) {
    return h.response({ error: "Email dan pasword harus diisi" }).code(400);
  }

  try {
    const login = getAuth();
    await signInWithEmailAndPassword(login,email, password).then((userCredential) => {
      const user = userCredential.user;
      return h.response({
        message: "Login Successful",
        user: {
          uid: user.uid,
          email: user.email,
        },
      });
    });
  } catch (error) {
    console.error("Error Logging in:", error);
    return h.response({ error: "Gagal masuk. Silakan coba lagi." }).code(500);
  }
};
