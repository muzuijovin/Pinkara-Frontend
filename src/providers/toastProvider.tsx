"use client";

import { ToastContainer } from "react-toastify";

// notifikasi singkat (sukses / gagal), hilang otomatis 4 detik
export default function ToastProvider() {
  return <ToastContainer position="top-right" autoClose={4000} newestOnTop closeOnClick pauseOnHover />;
}
