// backend/routes/auth.js
import { auth, collection, db, getAuth, query, signInWithEmailAndPassword, where } from "../firebase.js";
import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import { getDocs } from "firebase/firestore";

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
    const login = getAuth();
    await signInWithEmailAndPassword(login, email, password).then(
      (userCredential) => {
        const user = userCredential.user;
        return h.response({
          message: "Login Successful",
          user: {
            uid: user.uid,
            email: user.email,
          },
        });
      }
    );
  } catch (error) {
    console.error("Error Logging in:", error);
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
          content:
            "Anda adalah asisten kesehatan virtual yang memberikan informasi umum dalam Bahasa Indonesia. Jangan pernah memberikan diagnosis atau resep medis. Jelaskan secara singkat apa itu kondisi kulit yang disebutkan, lalu berikan beberapa tips perawatan umum yang aman dan tidak bersifat medis. Selalu akhiri dengan peringatan untuk berkonsultasi dengan dokter profesional.",
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
      "Saran tidak dapat dibuat saat ini.";
    return h.response({ advice }).code(200);
  } catch (error) {
    console.error("Error calling Groq API:", error);
    h.response({ error: "Failed to generate advice" }).code(500);
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
    // Menggunakan Firebase Admin SDK untuk query Firestore
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
    console.error("Error fetching from Firestore:", error); // Error akan tercetak di sini
    return h.response({ error: "Gagal mengambil riwayat scan." }).code(500);
  }
};
