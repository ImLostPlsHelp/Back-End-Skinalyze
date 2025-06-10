// backend/routes/auth.js
import { auth, db, getAuth, signInWithEmailAndPassword } from "../firebase.js";
import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";

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

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const GroqHandler = async (request, h) => {
  const { disease } = request.payload;

    if (!disease) {
        return h.response({ error: 'Disease name is required' }).code(400);
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                 {
                    role: 'system',
                    content: "Anda adalah asisten kesehatan virtual yang memberikan informasi umum dalam Bahasa Indonesia. Jangan pernah memberikan diagnosis atau resep medis. Jelaskan secara singkat apa itu kondisi kulit yang disebutkan, lalu berikan beberapa tips perawatan umum yang aman dan tidak bersifat medis. Selalu akhiri dengan peringatan untuk berkonsultasi dengan dokter profesional."
                },
                {
                    role: 'user',
                    content: `Tolong berikan informasi dan saran umum untuk kondisi: ${disease}`
                }
            ],
            model: 'llama3-8b-8192',
            temperature: 0.7,
        });

        const advice = chatCompletion.choices[0]?.message?.content || 'Saran tidak dapat dibuat saat ini.';
        return h.response({ advice }).code(200);

    } catch (error) {
        console.error('Error calling Groq API:', error);
        h.response({ error: 'Failed to generate advice' }).code(500);
    }
};
