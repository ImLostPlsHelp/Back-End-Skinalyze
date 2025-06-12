// backend/routes/auth.js
import { auth, collection, db, getAuth, query, signInWithEmailAndPassword, where } from "../firebase.js";
import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import { doc, getDoc, getDocs } from "firebase/firestore";

dotenv.config();

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
    const clientAuth = getAuth(); // Mengasumsikan getAuth() adalah dari client SDK
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;
    const uid = user.uid;

    // Ambil informasi pengguna dari koleksi 'user-information'
    const userDocRef = db.collection("user-information").doc(uid);
    const docSnapshot = await userDocRef.get();

    let firstName = "";
    let lastName = "";

    if (docSnapshot.exists) {
      const userInfo = docSnapshot.data();
      firstName = userInfo.firstName || "";
      lastName = userInfo.lastName || "";
    } else {
      // Handle kasus di mana dokumen informasi pengguna tidak ditemukan,
      // meskipun ini seharusnya tidak terjadi jika SignUpHandler berjalan dengan benar.
      console.warn(`User information not found for UID: ${uid}`);
    }

    // Anda mungkin juga ingin mengirim token ID ke klien untuk sesi berikutnya
    const idToken = await user.getIdToken();

    return h.response({
      message: "Login Successful",
      user: {
        uid: user.uid,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        token: idToken, // Kirim token ke client
      },
    }).code(200); // Login sukses biasanya 200

  } catch (error) {
    console.error("Error Logging in:", error);
    // Pertimbangkan untuk memberikan kode status yang lebih spesifik, misal 401 untuk kredensial salah
    // atau berdasarkan kode error Firebase
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return h.response({ error: "Email atau password salah." }).code(401);
    }
    return h.response({ error: "Gagal masuk. Silakan coba lagi." }).code(500);
  }
};

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const GroqHandler = async (request, h) => {
  const { disease } = request.payload;

  if (!disease) {
    return h.response({ error: "Disease name is required" }).code(400);
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
              Anda adalah asisten kesehatan virtual yang memberikan informasi umum.
              Tugas Anda adalah membuat DUA bagian dalam satu jawaban:
              1.  DESKRIPSI: Jelaskan secara singkat apa itu kondisi kulit yang disebutkan.
              2.  SARAN: Berikan beberapa tips perawatan umum yang aman dan tidak bersifat medis.

              PENTING: Setelah menulis bagian DESKRIPSI, sisipkan sebuah pemisah unik di baris baru yaitu: ---PEMISAH---
              
              Contoh format jawaban yang benar:
              [Ini adalah paragraf deskripsi penyakitnya...]
              ---PEMISAH---
              [Ini adalah paragraf saran perawatannya...]

              Selalu akhiri bagian SARAN dengan peringatan untuk berkonsultasi dengan dokter profesional. Jangan pernah memberikan diagnosis atau resep medis.
            `,
          },
        {
          role: "user",
          content: `Tolong berikan informasi dan saran umum untuk kondisi: ${disease}`,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
    });

    const advice =
      chatCompletion.choices[0]?.message?.content ||
      "Deskripsi dan saran tidak dapat dibuat saat ini.";
    return h.response({ advice }).code(200);
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return h.response({ error: "Failed to generate advice" }).code(500);
  }
};

export const saveResultHandler = async (request, h) => {
  const authToken = request.headers.authorization;
  const { name, risk, status, image } = request.payload;
  let uid = null;
  if (!name || !risk || !status || !image) {
    return h.response({ error: "Semua field harus diisi" }).code(400);
  }

  if (!authToken) {
    return h.response({ error: "Unauthorized" }).code(401);
  }

  try {
    const token = await auth.verifyIdToken(authToken.replace("Bearer ", ""));
    uid = token.uid;
  } catch (error) {
    console.error("Error Verifying Token:", error);
    return h.response({ error: "Unauthorized" }).code(401);
  }

  if (!uid) {
    console.error("No UID found in token");
    return h.response({ error: "Unauthorized" }).code(401);
  }

  try {
    const resultId = nanoid();
    await db.collection("save-result").doc(resultId).set({
      uid,
      name,
      risk,
      status,
      image,
      createdAt: new Date(),
    });

    return h
      .response({ message: "Result saved successfully", id: resultId })
      .code(201);
  } catch (error) {
    console.error("Error saving result:", error);
    return h
      .response({ error: "Gagal menyimpan hasil. Silakan coba lagi." })
      .code(500);
  }
};

export const getScanHistoryHandler = async (request, h) => {
  const authToken = request.headers.authorization;
  let uid = null;

  if (!authToken) {
    return h.response({ error: "Unauthorized" }).code(401);
  }

  try {
    const decodedToken = await auth.verifyIdToken(authToken.replace("Bearer ", ""));
    uid = decodedToken.uid;
  } catch (error) {
    console.error("Error Verifying Token:", error);
    return h.response({ error: "Unauthorized" }).code(401);
  }

  if (!uid) {
    console.error("No UID found in token");
    return h.response({ error: "Unauthorized" }).code(401);
  }

  try {
    const snapshot = await db.collection("save-result").where("uid", "==", uid).get();

    const results = [];
    if (snapshot.empty) {
      return h.response({ message: "Tidak ada riwayat scan ditemukan", results: [] }).code(404);
    }

    snapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    return h.response({
      message: "Riwayat scan berhasil diambil",
      results,
    }).code(200);

  } catch (error) {
    console.error("Error fetching from Firestore:", error);
    return h.response({ error: "Gagal mengambil riwayat scan." }).code(500);
  }
};

export const getUserInformation = async (request, h) => {
  const authToken = request.headers.authorization;
  let uid = null;

  if (!authToken) {
    return h.response({ error: "Unauthorized" }).code(401);
  }

  try {
    const decodedToken = await auth.verifyIdToken(authToken.replace("Bearer ", ""));
    uid = decodedToken.uid;
  } catch (error) {
    console.error("Error Verifying Token:", error);
    return h.response({ error: "Unauthorized" }).code(401);
  }

  if (!uid) {
    console.error("No UID found in token");
    return h.response({ error: "Unauthorized" }).code(401);
  }

  try {
    const userDocRef = db.collection("user-information").doc(uid);

    const docSnapshot = await userDocRef.get();

    if(!docSnapshot.exists) {
      return h.response({ message: "User information not found" }).code(404);
    }

    const userInfo = docSnapshot.data();

    return h.response({
      message: "Riwayat scan berhasil diambil",
      user: {
        uid: docSnapshot.id,
        ...userInfo,
      },
    }).code(200);

  } catch (error) {
    console.error("Error fetching from Firestore:", error);
    return h.response({ error: "Gagal mengambil riwayat scan." }).code(500);
  }
};

